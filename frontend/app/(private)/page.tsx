// page.tsx (Main Logic)
"use client";

import React, { useEffect, useState } from "react";
import { Typography, Card, App } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getLibrary, generateStory, generateAudioArchive } from "@/lib/api";
import { StoryForm } from "@/components/StoryForm/StoryForm";
import { StoryResult } from "@/components/StoryResult/StoryResult";
import { useStoryFormStore } from "@/store/storyFormStore";

// Import sub-components

const { Title } = Typography;

export default function CreateStoryPage() {
  const { message } = App.useApp();

  // States from Zustand store
  const formData = useStoryFormStore((state) => state.formData);
  const setFormData = useStoryFormStore((state) => state.setFormData);
  const selectedVoiceId = useStoryFormStore((state) => state.selectedVoiceId);
  const setSelectedVoiceId = useStoryFormStore((state) => state.setSelectedVoiceId);

  // To prevent hydration mismatch with persisted state, we only render the form when mounted
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

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
