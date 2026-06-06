import { Dialog, Button, Flex, Text, Box } from "@radix-ui/themes";

export const WelcomeModal = () => {
    const isFirstVisit = !localStorage.getItem("terra_first_visit_done");

    const markAsVisited = () => {
        localStorage.setItem("terra_first_visit_done", "true");
    };

    return (
        <Dialog.Root 
            defaultOpen={isFirstVisit} 
            onOpenChange={(isOpen) => {
                if (!isOpen) markAsVisited();
            }}
        >
            <Dialog.Content maxWidth="450px" className="bg-(--gray-1) rounded-2xl p-6 shadow-xl border border-(--gray-6)">
                <Dialog.Title size="6" mb="2" weight="bold">
                    Welcome to Terra
                </Dialog.Title>
                <Dialog.Description size="2" color="gray" mb="5">
                    An interactive procedural terrain generator. Explore and create your own unique worlds in real-time.
                </Dialog.Description>

                <Box mb="6">
                    <Flex direction="column" gap="4">
                        <Flex gap="3" align="start">
                            <Box>
                                <Text size="2" weight="medium" as="div">Explore</Text>
                                <Text size="2" color="gray" as="div">Drag the map to discover different regions.</Text>
                            </Box>
                        </Flex>
                        <Flex gap="3" align="start">
                            <Box>
                                <Text size="2" weight="medium" as="div">Customize</Text>
                                <Text size="2" color="gray" as="div">Use the control panel to tweak sea level, climate, and more.</Text>
                            </Box>
                        </Flex>
                        <Flex gap="3" align="start">
                            <Box>
                                <Text size="2" weight="medium" as="div">Analyze</Text>
                                <Text size="2" color="gray" as="div">Switch view modes to analyze height, moisture, and temperature.</Text>
                            </Box>
                        </Flex>
                    </Flex>
                </Box>

                <Flex justify="end">
                    <Dialog.Close>
                        <Button 
                            size="2" 
                            variant="solid" 
                            color="gray"
                            highContrast
                            onClick={markAsVisited} 
                            className="cursor-pointer"
                        >
                            Get Started
                        </Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};
