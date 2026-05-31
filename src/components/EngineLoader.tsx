import { Flex, Spinner, Text } from "@radix-ui/themes";

export const EngineLoader = () => {
    return (
        <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            gap="4" 
            className="absolute inset-0 z-10 bg-(--gray-1) bg-opacity-80"
        >
            <Spinner size="3" />
            <Text size="3" color="gray" weight="medium">
                Initializing Terrain Engine...
            </Text>
        </Flex>
    );
};
