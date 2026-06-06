import { Flex, Heading, Text, Button } from "@radix-ui/themes";
import { AlertCircle } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            gap="4"
            className="w-full h-screen bg-(--gray-1) p-6 text-center"
        >
            <AlertCircle size={48} className="text-ruby-9" />
            <Heading size="6" color="ruby">
                Something went wrong
            </Heading>
            <Text color="gray" size="3" className="max-w-md">
                An unexpected error occurred in the application or the terrain engine.
            </Text>
            
            <Flex direction="column" className="bg-(--gray-3) p-4 rounded-md text-left w-full max-w-lg border border-ruby-a4 overflow-auto">
                <Text size="2" color="ruby" weight="bold">
                    Error message:
                </Text>
                <Text size="2" color="gray" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    {error instanceof Error ? error.message : String(error)}
                </Text>
            </Flex>

            <Button size="3" onClick={resetErrorBoundary} color="ruby" variant="soft" className="mt-4 cursor-pointer">
                Try again
            </Button>
        </Flex>
    );
};
