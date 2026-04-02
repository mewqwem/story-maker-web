import React from "react";
import { Card, Flex, Typography, Select, Button, Divider } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import { ILibraryItem } from "@/type/library";

const { Text } = Typography;

interface StoryResultProps {
  script: string;
  voices: ILibraryItem[] | undefined;
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
  onMakeVoice: () => void;
  isAudioPending: boolean;
}

export const StoryResult: React.FC<StoryResultProps> = ({
  script,
  voices,
  selectedVoiceId,
  setSelectedVoiceId,
  onMakeVoice,
  isAudioPending,
}) => {
  return (
    <Card
      title="AI Result: Please review the text"
      style={{ marginTop: 20, background: "#000", border: "1px solid #333" }}
    >
      <pre
        style={{
          whiteSpace: "pre-wrap",
          color: "#ccc",
          padding: "10px",
          background: "#111",
          borderRadius: "8px",
        }}
      >
        {script}
      </pre>

      <Divider style={{ borderColor: "#333" }} />

      <Flex align="center" gap="middle">
        <Text strong>Select Voice:</Text>
        <Select
          style={{ width: 250 }}
          placeholder="Choose a voice from Library"
          onChange={setSelectedVoiceId}
          options={voices?.map((v) => ({
            label: `${v.name} (${v.language || "N/A"})`,
            value: v.content,
          }))}
        />

        <Button
          type="primary"
          icon={<AudioOutlined />}
          loading={isAudioPending}
          disabled={!selectedVoiceId}
          onClick={onMakeVoice}
        >
          Make Voice & Download ZIP
        </Button>
      </Flex>
    </Card>
  );
};
