import { Box } from "@radix-ui/themes";
import { Map } from "./Map";
import { MapControl } from "./MapControl";
import { useMapControl } from "../hooks";

export const MapMediator = () => {
    const { terrainConfig, updateConfig } = useMapControl();

    return (
        <Box className="w-full h-full relative overflow-hidden">
            <Box className="absolute inset-0 z-0">
                <Map terrainConfig={terrainConfig} />
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
