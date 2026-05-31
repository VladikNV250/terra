import {
    Flex,
    Button,
    Heading,
    Separator,
    Box,
    RadioGroup,
    Text,
    IconButton,
} from "@radix-ui/themes";
import type { TerrainConfig } from "../../types/terrain";
import type { SubmitEvent } from "react";
import { ControlField } from "./ControlField";
import { Settings, X } from "lucide-react";
import { useState } from "react";

interface Props {
    terrainConfig: TerrainConfig;
    updateConfig: (e: SubmitEvent<HTMLFormElement>) => void;
}

export const MapControl = ({ terrainConfig, updateConfig }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState<Partial<TerrainConfig>>({});

    const currentConfig = { ...terrainConfig, ...draft };

    const handleChange = (name: keyof TerrainConfig, value: string) => {
        setDraft((prev) => ({
            ...prev,
            [name]: name === "viewMode" ? value : Number(value),
        }));
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        updateConfig(e);
        setDraft({});
    };

    return (
        <Box className="relative h-full pointer-events-none flex justify-end">
            <Box
                className={`absolute top-0 right-0 transition-all duration-300 ease-in-out origin-top-right ${
                    isOpen
                        ? "opacity-0 scale-90 pointer-events-none"
                        : "opacity-100 scale-100 pointer-events-auto"
                }`}
            >
                <IconButton
                    size="3"
                    variant="surface"
                    color="gray"
                    highContrast
                    className="cursor-pointer shadow-md rounded-xl"
                    onClick={() => setIsOpen(true)}
                >
                    <Settings size={20} />
                </IconButton>
            </Box>

            <Flex
                direction="column"
                gapY="4"
                className={`bg-(--gray-3) p-4 flex flex-col gap-y-4 rounded-2xl shadow-xl h-full w-[300px] border border-(--gray-a4) origin-top-right transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "opacity-100 scale-100 pointer-events-auto translate-x-0"
                        : "opacity-0 scale-95 pointer-events-none translate-x-4"
                }`}
            >
                <Flex justify="between" align="center">
                    <Heading size="6" weight="bold" color="gray" highContrast>
                        Terra
                    </Heading>
                    <IconButton
                        size="2"
                        variant="ghost"
                        color="gray"
                        className="cursor-pointer"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={20} />
                    </IconButton>
                </Flex>
                <Separator size="4" />

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <Box className="flex-1 overflow-y-auto pr-3 mb-4 space-y-6">
                        <Box className="space-y-3">
                            <Heading size="3" color="gray" mb="2">
                                View Mode
                            </Heading>
                            <RadioGroup.Root
                                name="viewMode"
                                value={currentConfig.viewMode}
                                onValueChange={(val) => handleChange("viewMode", val)}
                            >
                                <Flex gap="2" direction="column">
                                    <Text as="label" size="2">
                                        <Flex gap="2">
                                            <RadioGroup.Item value="Biome" />{" "}
                                            Biome (Normal)
                                        </Flex>
                                    </Text>
                                    <Text as="label" size="2">
                                        <Flex gap="2">
                                            <RadioGroup.Item value="Height" />{" "}
                                            Height Map
                                        </Flex>
                                    </Text>
                                    <Text as="label" size="2">
                                        <Flex gap="2">
                                            <RadioGroup.Item value="Temperature" />{" "}
                                            Temperature Map
                                        </Flex>
                                    </Text>
                                    <Text as="label" size="2">
                                        <Flex gap="2">
                                            <RadioGroup.Item value="Moisture" />{" "}
                                            Moisture Map
                                        </Flex>
                                    </Text>
                                </Flex>
                            </RadioGroup.Root>
                        </Box>

                        <Separator size="4" />

                        <Box className="space-y-3">
                            <Heading size="3" color="ruby" mb="2">
                                General
                            </Heading>
                            <Flex gapY="3" direction="column">
                                <ControlField
                                    label="Seed"
                                    name="seed"
                                    value={currentConfig.seed}
                                    onChange={(val) => handleChange("seed", val)}
                                />
                            </Flex>
                        </Box>

                        <Separator size="4" />

                        <Box className="space-y-3">
                            <Heading size="3" color="jade" mb="2">
                                Base Terrain
                            </Heading>
                            <Flex gapY="3" direction="column">
                                <ControlField
                                    label="Zoom"
                                    name="zoom"
                                    value={currentConfig.zoom}
                                    onChange={(val) => handleChange("zoom", val)}
                                    step={0.1}
                                />
                                <ControlField
                                    label="Contrast"
                                    name="contrast"
                                    value={currentConfig.contrast}
                                    onChange={(val) => handleChange("contrast", val)}
                                    step={0.1}
                                />
                                <ControlField
                                    label="Sea Level"
                                    name="seaLevel"
                                    value={currentConfig.seaLevel}
                                    onChange={(val) => handleChange("seaLevel", val)}
                                />
                            </Flex>
                        </Box>

                        <Separator size="4" />

                        <Box className="space-y-3">
                            <Heading size="3" color="orange" mb="2">
                                Temperature
                            </Heading>
                            <Flex gapY="3" direction="column">
                                <ControlField
                                    label="Temp Scale"
                                    name="tempScale"
                                    value={currentConfig.tempScale}
                                    onChange={(val) => handleChange("tempScale", val)}
                                />
                            </Flex>
                        </Box>

                        <Separator size="4" />

                        <Box className="space-y-3">
                            <Heading size="3" color="blue" mb="2">
                                Moisture
                            </Heading>
                            <Flex gapY="3" direction="column">
                                <ControlField
                                    label="Moisture Scale"
                                    name="moistureScale"
                                    value={currentConfig.moistureScale}
                                    onChange={(val) => handleChange("moistureScale", val)}
                                />
                            </Flex>
                        </Box>
                    </Box>

                    <Button
                        type="submit"
                        size="3"
                        className="w-full mt-auto"
                        color="indigo"
                        variant="soft"
                    >
                        Generate Map
                    </Button>
                </form>
            </Flex>
        </Box>
    );
};
