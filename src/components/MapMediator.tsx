import { Box, Flex, Text } from "@radix-ui/themes";
import { Map } from "./Map";
import { MapControl } from "./MapControl";
import { useMapControl } from "../hooks";
import { useState } from "react";

export const MapMediator = () => {
    const { terrainConfig, updateConfig } = useMapControl();
    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

    return (
        <Box className="w-full h-full relative overflow-hidden">
            <Box className="absolute inset-0 z-0">
                <Map 
                    terrainConfig={terrainConfig} 
                    onPointerMoveMap={setMouseCoords}
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

            <Box className="absolute top-4 right-4 z-10 bottom-4 pointer-events-none">
                <MapControl
                    terrainConfig={terrainConfig}
                    updateConfig={updateConfig}
                />
            </Box>
        </Box>
    );
};
