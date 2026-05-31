import { Box, Flex, Text, IconButton } from "@radix-ui/themes";
import { Plus, Minus } from "lucide-react";
import { Map } from "./Map";
import { MapControl } from "./MapControl";
import { WelcomeModal } from "./WelcomeModal";
import { useMapControl } from "../hooks";
import { useState } from "react";

export const MapMediator = () => {
    const { terrainConfig, updateConfig, updateZoom } = useMapControl();
    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

    return (
        <Box className="w-full h-full relative overflow-hidden">
            <Box className="absolute inset-0 z-0">
                <Map 
                    terrainConfig={terrainConfig} 
                    onPointerMoveMap={setMouseCoords}
                    onZoom={updateZoom}
                />
            </Box>
            
            <Box className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <Flex
                    align="center"
                    justify="center"
                    className="bg-(--gray-3) px-4 py-3 rounded-2xl shadow-xl border border-(--gray-a4)"
                >
                    <Text size="2" weight="medium" color="gray" highContrast>
                        X: {mouseCoords.x}, Y: {mouseCoords.y}
                    </Text>
                </Flex>
            </Box>

            <Box className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                <Flex direction="column" gap="2" className="bg-(--gray-3) p-2 rounded-2xl shadow-xl border border-(--gray-a4)">
                    <IconButton 
                        size="3" 
                        variant="soft" 
                        color="gray" 
                        highContrast
                        onClick={() => updateZoom(terrainConfig.zoom + 0.1)}
                        className="cursor-pointer"
                    >
                        <Plus size={20} />
                    </IconButton>
                    <IconButton 
                        size="3" 
                        variant="soft" 
                        color="gray" 
                        highContrast
                        onClick={() => updateZoom(terrainConfig.zoom - 0.1)}
                        className="cursor-pointer"
                    >
                        <Minus size={20} />
                    </IconButton>
                </Flex>
            </Box>

            <Box className="absolute top-4 right-4 z-10 bottom-32 pointer-events-none">
                <MapControl
                    terrainConfig={terrainConfig}
                    updateConfig={updateConfig}
                />
            </Box>

            <WelcomeModal />
        </Box>
    );
};
