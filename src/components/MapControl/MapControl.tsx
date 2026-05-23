import { Flex, Button, Heading, Separator, Box, RadioGroup, Text } from "@radix-ui/themes";
import type { TerrainConfig } from "../../types/terrain";
import type { SubmitEvent } from "react";
import { ControlField } from "./ControlField";

interface Props {
    terrainConfig: TerrainConfig;
    updateConfig: (e: SubmitEvent<HTMLFormElement>) => void;
}

export const MapControl = ({ terrainConfig, updateConfig }: Props) => {
    return (
        <form onSubmit={updateConfig} className="h-full flex flex-col overflow-hidden">
            <Box className="flex-1 overflow-y-auto pr-3 mb-4 space-y-6">
                
                <Box className="space-y-3">
                    <Heading size="3" color="gray" mb="2">View Mode</Heading>
                    <RadioGroup.Root name="viewMode" defaultValue={terrainConfig.viewMode}>
                        <Flex gap="2" direction="column">
                            <Text as="label" size="2"><Flex gap="2"><RadioGroup.Item value="Biome" /> Biome (Normal)</Flex></Text>
                            <Text as="label" size="2"><Flex gap="2"><RadioGroup.Item value="Height" /> Height Map</Flex></Text>
                            <Text as="label" size="2"><Flex gap="2"><RadioGroup.Item value="Temperature" /> Temperature Map</Flex></Text>
                            <Text as="label" size="2"><Flex gap="2"><RadioGroup.Item value="Moisture" /> Moisture Map</Flex></Text>
                        </Flex>
                    </RadioGroup.Root>
                </Box>

                <Separator size="4" />

                <Box className="space-y-3">
                    <Heading size="3" color="ruby" mb="2">General</Heading>
                    <Flex gapY="3" direction="column">
                        <ControlField label="Seed" name="seed" defaultValue={terrainConfig.seed} />
                        <ControlField label="Width" name="width" defaultValue={terrainConfig.width} />
                        <ControlField label="Height" name="height" defaultValue={terrainConfig.height} />
                    </Flex>
                </Box>

                <Separator size="4" />

                <Box className="space-y-3">
                    <Heading size="3" color="jade" mb="2">Base Terrain</Heading>
                    <Flex gapY="3" direction="column">
                        <ControlField label="Scale" name="scale" defaultValue={terrainConfig.scale} />
                        <ControlField label="Contrast" name="contrast" defaultValue={terrainConfig.contrast} step={0.1} />
                        <ControlField label="Sea Level" name="seaLevel" defaultValue={terrainConfig.seaLevel} />
                    </Flex>
                </Box>

                <Separator size="4" />

                <Box className="space-y-3">
                    <Heading size="3" color="orange" mb="2">Temperature</Heading>
                    <Flex gapY="3" direction="column">
                        <ControlField label="Temp Scale" name="tempScale" defaultValue={terrainConfig.tempScale} />
                    </Flex>
                </Box>

                <Separator size="4" />

                <Box className="space-y-3">
                    <Heading size="3" color="blue" mb="2">Moisture</Heading>
                    <Flex gapY="3" direction="column">
                        <ControlField label="Moisture Scale" name="moistureScale" defaultValue={terrainConfig.moistureScale} />
                    </Flex>
                </Box>

            </Box>

            <Button type="submit" size="3" className="w-full mt-auto" color="indigo" variant="soft">
                Generate Map
            </Button>
        </form>
    );
};
