import { Flex, Heading, Separator } from "@radix-ui/themes";
import { Map } from "./Map";
import { MapControl } from "./MapControl";
import { useMapControl } from "../hooks";



export const MapMediator = () => {
    const { terrainConfig, updateConfig } = useMapControl();

    return (
        <Flex justify="between" className="w-full h-full p-3">
            <Flex direction="column" gapY="4" className="bg-(--gray-3) p-4 flex flex-col gap-y-4 rounded-xl">
                <Heading size={"6"} weight={"bold"} color="gray" align={"center"} highContrast>
                    Terra
                </Heading>
                <Separator size={"4"} />
                <MapControl
                    terrainConfig={terrainConfig}
                    updateConfig={updateConfig}
                />
            </Flex>
            <Map terrainConfig={terrainConfig} />
        </Flex>
    );
};
