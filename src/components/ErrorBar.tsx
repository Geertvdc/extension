import * as React from "react";
import { IButtonProps } from "azure-devops-ui/Button";
import { MessageCardSeverity, MessageCard } from "azure-devops-ui/MessageCard";

interface IErrorBarProps {
    message: string;
    onDismiss?: () => void;
    linkProps?: { text: string; link: string };
}

const ErrorBar = ({ message, onDismiss, linkProps }: IErrorBarProps) => {
    const linkText = linkProps?.text ?? "Contact maintainers";
    const onClick =
        linkProps?.link ?? "https://github.com/azure-devops-compliance/";

    const buttonProps: IButtonProps[] = [
        {
            text: linkText,
            onClick: () => {
                window.open(onClick, "_blank");
            }
        }
    ];

    return (
        <div>
            {message && (
                <MessageCard
                    buttonProps={buttonProps}
                    className="flex-self-stretch"
                    // @ts-ignore
                    severity={MessageCardSeverity.Error}
                    onDismiss={() => {
                        onDismiss && onDismiss();
                    }}
                >
                    {message}
                </MessageCard>
            )}
        </div>
    );
};

export default ErrorBar;
