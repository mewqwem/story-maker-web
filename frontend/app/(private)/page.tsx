// page.tsx (Main Logic)
"use client";

import React, { useState } from "react";
import { Typography, Card, App } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getLibrary, generateStory, generateAudioArchive } from "@/lib/api";
import { IGeneratePayload } from "@/type/generate";
import { StoryForm } from "@/components/StoryForm/StoryForm";
import { StoryResult } from "@/components/StoryResult/StoryResult";

// Import sub-components

const { Title } = Typography;

export default function CreateStoryPage() {
  const { message } = App.useApp();

  // States
  const [formData, setFormData] = useState<IGeneratePayload>({
    projectName: "",
    title: "",
    templateId: "",
    language: "Ukrainian",
  });
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");

  // Data fetching
  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ["templates", "story"],
    queryFn: () => getLibrary("story"),
  });
  const { data: voices } = useQuery({
    queryKey: ["templates", "voice"],
    queryFn: () => getLibrary("voice"),
  });

  // Mutations
  const storyMutation = useMutation({
    mutationFn: generateStory,
    onSuccess: (data) =>
      message.success(`Project "${data.projectName}" generated!`),
  });

  const audioMutation = useMutation({
    mutationFn: generateAudioArchive,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.projectName}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title level={2}>
        <RocketOutlined /> Create New Project
      </Title>

      <Card variant="borderless" style={{ background: "#1a1a1a" }}>
        <StoryForm
          formData={formData}
          setFormData={setFormData}
          templates={templates}
          loadingTemplates={loadingTemplates}
          onSubmit={() => storyMutation.mutate(formData)}
          isPending={storyMutation.isPending}
        />
      </Card>

      {storyMutation.data?.success && (
        <StoryResult
          script={storyMutation.data.script}
          voices={voices}
          selectedVoiceId={selectedVoiceId}
          setSelectedVoiceId={setSelectedVoiceId}
          isAudioPending={audioMutation.isPending}
          onMakeVoice={() =>
            audioMutation.mutate({
              text: storyMutation.data!.script,
              voiceId: selectedVoiceId,
              projectName: formData.projectName,
            })
          }
        />
      )}
    </div>
  );
}
