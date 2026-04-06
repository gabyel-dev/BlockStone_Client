import { useEffect, useMemo, useRef, useState } from "react";
import {
  DASHBOARD_CARD_IDS,
  DEFAULT_CARD_SHAPES,
  getNextShape,
  moveInArray,
  readCardOrder,
  readCardShapes,
  readHiddenCards,
  writeCardOrder,
  writeCardShapes,
  writeHiddenCards,
} from "../constants/layout";

export default function useDashboardLayoutManager(userId) {
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.innerWidth >= 1024;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [cardOrder, setCardOrder] = useState(DASHBOARD_CARD_IDS);
  const [cardShapes, setCardShapes] = useState(DEFAULT_CARD_SHAPES);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [activeDragCardId, setActiveDragCardId] = useState(null);
  const [hoverDragCardId, setHoverDragCardId] = useState(null);

  const dragCardIdRef = useRef(null);

  const canEditLayout = isLargeScreen;

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!canEditLayout) {
      setIsEditMode(false);
      setActiveDragCardId(null);
      setHoverDragCardId(null);
      dragCardIdRef.current = null;
    }
  }, [canEditLayout]);

  useEffect(() => {
    setCardOrder(readCardOrder(userId));
    setCardShapes(readCardShapes(userId));
    setHiddenCards(readHiddenCards(userId));
  }, [userId]);

  useEffect(() => {
    writeCardOrder(userId, cardOrder);
  }, [cardOrder, userId]);

  useEffect(() => {
    writeCardShapes(userId, cardShapes);
  }, [cardShapes, userId]);

  useEffect(() => {
    writeHiddenCards(userId, hiddenCards);
  }, [hiddenCards, userId]);

  const visibleCardOrder = useMemo(
    () => cardOrder.filter((cardId) => !hiddenCards.includes(cardId)),
    [cardOrder, hiddenCards],
  );

  const toggleEditMode = () => {
    if (!canEditLayout) {
      return;
    }

    setIsEditMode((previous) => {
      const next = !previous;
      if (!next) {
        setActiveDragCardId(null);
        setHoverDragCardId(null);
        dragCardIdRef.current = null;
      }
      return next;
    });
  };

  const handleCardDragStart = (cardId) => {
    if (!isEditMode || !canEditLayout) {
      return;
    }

    dragCardIdRef.current = cardId;
    setActiveDragCardId(cardId);
    setHoverDragCardId(cardId);
  };

  const handleCardDragEnter = (cardId) => {
    if (!isEditMode || !canEditLayout || !dragCardIdRef.current) {
      return;
    }

    setHoverDragCardId(cardId);
  };

  const handleCardDragEnd = () => {
    if (!isEditMode || !canEditLayout) {
      return;
    }

    const draggedId = dragCardIdRef.current;
    const targetId = hoverDragCardId;

    if (draggedId && targetId && draggedId !== targetId) {
      setCardOrder((previous) => {
        const fromIndex = previous.indexOf(draggedId);
        const toIndex = previous.indexOf(targetId);
        return moveInArray(previous, fromIndex, toIndex);
      });
    }

    dragCardIdRef.current = null;
    setActiveDragCardId(null);
    setHoverDragCardId(null);
  };

  const resetCardLayout = () => {
    setCardOrder(DASHBOARD_CARD_IDS);
    setCardShapes(DEFAULT_CARD_SHAPES);
    setHiddenCards([]);
    setActiveDragCardId(null);
    setHoverDragCardId(null);
    dragCardIdRef.current = null;
  };

  const setCompactShapes = () => {
    setCardShapes((previous) => {
      const next = { ...previous };
      DASHBOARD_CARD_IDS.forEach((cardId) => {
        next[cardId] = cardId === "pulse" ? "wide" : "compact";
      });
      return next;
    });
  };

  const toggleCardShape = (cardId) => {
    setCardShapes((previous) => ({
      ...previous,
      [cardId]: getNextShape(previous[cardId]),
    }));
  };

  const toggleCardVisibility = (cardId) => {
    setHiddenCards((previous) =>
      previous.includes(cardId)
        ? previous.filter((id) => id !== cardId)
        : [...previous, cardId],
    );
  };

  const showAllCards = () => {
    setHiddenCards([]);
  };

  const shuffleLayout = () => {
    setCardOrder((previous) => {
      const next = [...previous];
      for (let index = next.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
      }
      return next;
    });
  };

  const focusCardFirst = (cardId) => {
    setCardOrder((previous) => {
      if (!previous.includes(cardId)) {
        return previous;
      }

      const next = previous.filter((id) => id !== cardId);
      next.unshift(cardId);
      return next;
    });
  };

  return {
    isLargeScreen,
    canEditLayout,
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    cardOrder,
    visibleCardOrder,
    cardShapes,
    hiddenCards,
    activeDragCardId,
    hoverDragCardId,
    handleCardDragStart,
    handleCardDragEnter,
    handleCardDragEnd,
    resetCardLayout,
    setCompactShapes,
    toggleCardShape,
    toggleCardVisibility,
    showAllCards,
    shuffleLayout,
    focusCardFirst,
  };
}
