function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function getIcon(
    type
) {
    const icons = {
        success: "✓",
        info: "i",
        warning: "!",
        error: "×",
        important: "◆"
    };

    return (
        icons[type] ??
        icons.info
    );
}


function getDefaultEyebrow(
    type
) {
    const labels = {
        success:
            "CONCLUÍDO",

        info:
            "INFORMAÇÃO",

        warning:
            "ATENÇÃO",

        error:
            "NÃO FOI POSSÍVEL",

        important:
            "DECISÃO IMPORTANTE"
    };

    return (
        labels[type] ??
        labels.info
    );
}


function ensureModalRoot() {
    let root =
        document.querySelector(
            "#game-feedback-root"
        );

    if (!root) {
        root =
            document.createElement(
                "div"
            );

        root.id =
            "game-feedback-root";

        document.body
            .appendChild(
                root
            );
    }

    return root;
}


function ensureToastStack() {
    let stack =
        document.querySelector(
            "#game-toast-stack"
        );

    if (!stack) {
        stack =
            document.createElement(
                "div"
            );

        stack.id =
            "game-toast-stack";

        stack.className =
            "feedback-toast-stack";

        document.body
            .appendChild(
                stack
            );
    }

    return stack;
}


export function showFeedback({
    type = "info",

    eyebrow = null,

    title =
        "Informação",

    message = "",

    details = null,

    primaryLabel =
        "CONTINUAR",

    secondaryLabel =
        null,

    closeOnBackdrop =
        false
} = {}) {
    return new Promise(
        resolve => {
            const root =
                ensureModalRoot();


            root.innerHTML = `
                <div
                    class="feedback-overlay"
                    data-feedback-overlay
                >
                    <section
                        class="feedback-modal"
                        data-type="${escapeHtml(
                            type
                        )}"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="feedback-title"
                    >
                        <div class="feedback-header">

                            <div class="feedback-icon">
                                ${escapeHtml(
                                    getIcon(
                                        type
                                    )
                                )}
                            </div>

                            <div class="feedback-heading">

                                <div class="feedback-eyebrow">
                                    ${escapeHtml(
                                        eyebrow ??
                                        getDefaultEyebrow(
                                            type
                                        )
                                    )}
                                </div>

                                <h2
                                    id="feedback-title"
                                    class="feedback-title"
                                >
                                    ${escapeHtml(
                                        title
                                    )}
                                </h2>

                            </div>

                        </div>


                        <div class="feedback-body">

                            <div>
                                ${escapeHtml(
                                    message
                                )}
                            </div>

                            ${
                                details
                                    ? `
                                        <div class="feedback-details">
                                            ${escapeHtml(
                                                details
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>


                        <div class="feedback-actions">

                            ${
                                secondaryLabel
                                    ? `
                                        <button
                                            type="button"
                                            class="feedback-button"
                                            data-feedback-secondary
                                        >
                                            ${escapeHtml(
                                                secondaryLabel
                                            )}
                                        </button>
                                    `
                                    : ""
                            }

                            <button
                                type="button"
                                class="
                                    feedback-button
                                    feedback-button-primary
                                "
                                data-feedback-primary
                            >
                                ${escapeHtml(
                                    primaryLabel
                                )}
                            </button>

                        </div>
                    </section>
                </div>
            `;


            const finish =
                result => {
                    root.innerHTML =
                        "";

                    resolve(
                        result
                    );
                };


            root
                .querySelector(
                    "[data-feedback-primary]"
                )
                ?.addEventListener(
                    "click",
                    () => {
                        finish(
                            "primary"
                        );
                    }
                );


            root
                .querySelector(
                    "[data-feedback-secondary]"
                )
                ?.addEventListener(
                    "click",
                    () => {
                        finish(
                            "secondary"
                        );
                    }
                );


            if (
                closeOnBackdrop
            ) {
                root
                    .querySelector(
                        "[data-feedback-overlay]"
                    )
                    ?.addEventListener(
                        "click",
                        event => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                finish(
                                    "dismiss"
                                );
                            }
                        }
                    );
            }


            const primary =
                root.querySelector(
                    "[data-feedback-primary]"
                );

            primary?.focus();
        }
    );
}


export function showToast({
    type = "info",

    title =
        "Nova informação",

    message = "",

    duration = 4000
} = {}) {
    const stack =
        ensureToastStack();

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "feedback-toast";

    toast.dataset.type =
        type;

    toast.innerHTML = `
        <div class="feedback-toast-title">
            ${escapeHtml(
                title
            )}
        </div>

        <div class="feedback-toast-message">
            ${escapeHtml(
                message
            )}
        </div>
    `;

    stack.prepend(
        toast
    );


    const remove =
        () => {
            if (
                !toast.isConnected
            ) {
                return;
            }

            toast.classList.add(
                "is-leaving"
            );

            window.setTimeout(
                () => {
                    toast.remove();
                },
                190
            );
        };


    window.setTimeout(
        remove,
        duration
    );


    toast.addEventListener(
        "click",
        remove
    );


    return toast;
}