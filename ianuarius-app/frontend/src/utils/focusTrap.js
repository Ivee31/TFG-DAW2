const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function attachFocusTrap(container, onClose) {
    const getFocusable = () => [...container.querySelectorAll(FOCUSABLE)];
    const previousFocus = document.activeElement;

    getFocusable()[0]?.focus();

    const onKey = (e) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key !== 'Tab') return;
        const els = getFocusable();
        if (!els.length) return;
        if (e.shiftKey) {
            if (document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus(); }
        } else {
            if (document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus(); }
        }
    };

    document.addEventListener('keydown', onKey);
    return () => {
        document.removeEventListener('keydown', onKey);
        previousFocus?.focus();
    };
}
