import { Flex, TextField, Text, Button } from "@radix-ui/themes";
import type { TerrainConfig } from "../types/terrain";
import type { SubmitEvent } from "react";

interface Props {
    terrainConfig: TerrainConfig;
    updateConfig: (e: SubmitEvent<HTMLFormElement>) => void;
}

export const MapControl = ({ terrainConfig, updateConfig }: Props) => {
    return (
        <form onSubmit={updateConfig} className="h-full flex flex-col justify-between gap-y-4">
            <Flex gapY={"3"} direction="column">
                <label htmlFor="seed">
                    <Text as="div" size="2" mb="1" weight="bold">Seed</Text>
                    <TextField.Root
                        name="seed"
                        type="number"
                        placeholder="Seed"
                        defaultValue={terrainConfig.seed.toString()}
                    />
                </label>
                <label htmlFor="scale">
                    <Text as="div" size="2" mb="1" weight="bold">Scale</Text>
                    <TextField.Root
                        name="scale"
                        type="number"
                        placeholder="Scale"
                        defaultValue={terrainConfig.scale.toString()}
                    />
                </label>
                <label htmlFor="octave">
                    <Text as="div" size="2" mb="1" weight="bold">Octave</Text>
                    <TextField.Root
                        name="octave"
                        type="number"
                        placeholder="Octave"
                        defaultValue={terrainConfig.octave.toString()}
                    />
                </label>
                <label htmlFor="persistence">
                    <Text as="div" size="2" mb="1" weight="bold">Persistence</Text>
                    <TextField.Root
                        name="persistence"
                        type="number"
                        step={"0.1"}
                        placeholder="Persistence"
                        defaultValue={terrainConfig.persistence.toString()}
                    />
                </label>
                <label htmlFor="amplitude">
                    <Text as="div" size="2" mb="1" weight="bold">Amplitude</Text>
                    <TextField.Root
                        name="amplitude"
                        type="number"
                        step={"0.1"}
                        placeholder="Amplitude"
                        defaultValue={terrainConfig.amplitude.toString()}
                    />
                </label>
                <label htmlFor="seaLevel">
                    <Text as="div" size="2" mb="1" weight="bold">Sea Level</Text>
                    <TextField.Root
                        id="seaLevel"
                        name="seaLevel"
                        type="number"
                        placeholder="Sea Level"
                        defaultValue={terrainConfig.seaLevel.toString()}
                    />
                </label>
            </Flex>
            <Button type="submit">
                Generate
            </Button>
        </form>
    );
};
