import { Flex, Button } from "@radix-ui/themes";
import type { TerrainConfig } from "../../types/terrain";
import type { SubmitEvent } from "react";
import { ControlField } from "./ControlField";

interface Props {
    terrainConfig: TerrainConfig;
    updateConfig: (e: SubmitEvent<HTMLFormElement>) => void;
}

export const MapControl = ({ terrainConfig, updateConfig }: Props) => {
    return (
        <form onSubmit={updateConfig} className="h-full flex flex-col justify-between gap-y-4">
            <Flex gapY={"3"} direction="column">
                <ControlField
                    label="Seed"
                    name="seed"
                    defaultValue={terrainConfig.seed}
                />
                <ControlField
                    label="Scale"
                    name="scale"
                    defaultValue={terrainConfig.scale}
                />
                <ControlField
                    label="Octave"
                    name="octave"
                    defaultValue={terrainConfig.octave}
                />
                <ControlField
                    label="Persistence"
                    name="persistence"
                    defaultValue={terrainConfig.persistence}
                    step={0.1}
                />
                <ControlField
                    label="Sea Level"
                    name="seaLevel"
                    defaultValue={terrainConfig.seaLevel}
                />
                <ControlField
                    label="Contrast"
                    name="contrast"
                    defaultValue={terrainConfig.contrast}
                />
                <ControlField
                    label="Width"
                    name="width"
                    defaultValue={terrainConfig.width}
                />
                <ControlField
                    label="Height"
                    name="height"
                    defaultValue={terrainConfig.height}
                />
            </Flex>
            <Button type="submit">
                Generate
            </Button>
        </form>
    );
};
