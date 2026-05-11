import { useRef, useState } from "react";
import { Map } from "../components";
import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";

function App() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [seed, setSeed] = useState(new Date().getTime());

    const applySeed = () => {
        if (!inputRef.current) return;
        const value = inputRef.current.value;
        setSeed(Number(value) || new Date().getTime());
    };

    return (
        <main className="bg-(--gray) px-10 pt-8 min-w-screen min-h-screen w-full h-full">
            <Flex
                direction={"column"}
                align={"center"}
                gap={"5"}
                width={"full"}
            >
                <Heading size={"6"} weight={"bold"} color="gray" highContrast>
                    Proceduraly generated map 512x512
                </Heading>
                <Map seed={seed} />
                <Flex gapX={"3"} align={"center"}>
                    <Text>Seed: </Text>
                    <TextField.Root
                        type="number"
                        placeholder="Seed"
                        defaultValue={seed.toString()}
                        ref={inputRef}
                    />
                    <Button onClick={applySeed}>Generate</Button>
                </Flex>
            </Flex>
        </main>
    );
}

export default App;
