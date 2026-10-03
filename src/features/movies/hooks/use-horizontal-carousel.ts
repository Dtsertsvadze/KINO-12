"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

type DragState = {
  active: boolean;
  startX: number;
  scrollLeft: number;
};

export function useHorizontalCarousel(itemCount: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [navigation, setNavigation] = useState({
    hasOverflow: false,
    atStart: true,
    atEnd: true,
  });

  const updateNavigation = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const maximumScroll = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth,
    );
    const nextNavigation = {
      hasOverflow: maximumScroll > 0,
      atStart: viewport.scrollLeft <= 1,
      atEnd: viewport.scrollLeft >= maximumScroll - 1,
    };

    setNavigation((currentNavigation) => {
      if (
        currentNavigation.hasOverflow === nextNavigation.hasOverflow &&
        currentNavigation.atStart === nextNavigation.atStart &&
        currentNavigation.atEnd === nextNavigation.atEnd
      ) {
        return currentNavigation;
      }

      return nextNavigation;
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    updateNavigation();

    const resizeObserver = new ResizeObserver(updateNavigation);
    resizeObserver.observe(viewport);
    viewport.addEventListener("scroll", updateNavigation, { passive: true });

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", updateNavigation);
    };
  }, [itemCount, updateNavigation]);

  function scrollByPage(direction: -1 | 1) {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollBy({
      left: direction * viewport.clientWidth,
      behavior: "smooth",
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (
      !viewport ||
      (event.target as HTMLElement).closest(
        "button, a, input, select, textarea, [role='button']",
      )
    ) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: viewport.scrollLeft,
    };
    viewport.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;

    if (!viewport || !dragState.active) {
      return;
    }

    viewport.scrollLeft =
      dragState.scrollLeft - (event.clientX - dragState.startX);
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    dragStateRef.current.active = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    viewportRef,
    navigation,
    scrollByPage,
    handlePointerDown,
    handlePointerMove,
    stopDragging,
  };
}
