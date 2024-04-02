import type { SelectProps } from "tamagui";
import React, { useState } from "react";
import { Platform } from "react-native";
import Markdown from "react-native-markdown-display";
import * as Application from "expo-application";
import * as Brightness from "expo-brightness";
import * as WebBrowser from "expo-web-browser";
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useToastController } from "@tamagui/toast";
import { useMutation } from "@tanstack/react-query";
import {
  Adapt,
  ScrollView,
  Select,
  Sheet,
  Spinner,
  Text,
  useTheme,
  View,
  XStack,
  YStack,
} from "tamagui";

import type { ThemeStoreOption } from "~/stores/theme";
import ScreenLayout from "~/components/layout/ScreenLayout";
import { MWButton } from "~/components/ui/Button";
import { MWSelect } from "~/components/ui/Select";
import { MWSeparator } from "~/components/ui/Separator";
import { MWSwitch } from "~/components/ui/Switch";
import { checkForUpdate } from "~/lib/update";
import { usePlayerSettingsStore } from "~/stores/settings";
import { useThemeStore } from "~/stores/theme";

const themeOptions: ThemeStoreOption[] = [
  "main",
  "blue",
  "gray",
  "red",
  "teal",
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { gestureControls, setGestureControls, autoPlay, setAutoPlay } =
    usePlayerSettingsStore();
  const toastController = useToastController();
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const [updateMarkdownContent, setUpdateMarkdownContent] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const mutation = useMutation({
    mutationKey: ["checkForUpdate"],
    mutationFn: checkForUpdate,
    onSuccess: (res) => {
      if (res) {
        setUpdateMarkdownContent(res.data.body!);
        setDownloadUrl(
          res.data.assets.find(
            (asset) =>
              asset.name ===
              `movie-web.${Platform.select({ ios: "ipa", android: "apk" })}`,
          )?.browser_download_url ?? "",
        );
        setShowUpdateSheet(true);
      } else {
        toastController.show("No updates available", {
          burntOptions: { preset: "none" },
          native: true,
          duration: 500,
        });
      }
    },
  });

  const handleGestureControlsToggle = async (isEnabled: boolean) => {
    if (isEnabled) {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === Brightness.PermissionStatus.GRANTED) {
        setGestureControls(isEnabled);
      }
    } else {
      setGestureControls(isEnabled);
    }
  };

  return (
    <ScreenLayout>
      <View padding={4}>
        <YStack gap="$8">
          <YStack gap="$4">
            <Text fontSize="$9" fontWeight="$semibold">
              Appearance
            </Text>
            <MWSeparator />
            <YStack gap="$2">
              <XStack gap="$4" alignItems="center">
                <Text fontWeight="$semibold" flexGrow={1}>
                  Theme
                </Text>
                <ThemeSelector />
              </XStack>
            </YStack>
          </YStack>

          <YStack gap="$4">
            <Text fontSize="$9" fontWeight="$semibold">
              Player
            </Text>
            <MWSeparator />
            <YStack gap="$2">
              <XStack gap="$4" alignItems="center">
                <Text fontWeight="$semibold" flexGrow={1}>
                  Gesture controls
                </Text>
                <MWSwitch
                  checked={gestureControls}
                  onCheckedChange={handleGestureControlsToggle}
                >
                  <MWSwitch.Thumb animation="quicker" />
                </MWSwitch>
              </XStack>
              <XStack gap="$4" alignItems="center">
                <Text fontWeight="$semibold" flexGrow={1}>
                  Autoplay
                </Text>
                <MWSwitch checked={autoPlay} onCheckedChange={setAutoPlay}>
                  <MWSwitch.Thumb animation="quicker" />
                </MWSwitch>
              </XStack>
            </YStack>
          </YStack>

          <YStack gap="$4">
            <Text fontSize="$9" fontWeight="$semibold">
              App
            </Text>
            <MWSeparator />
            <YStack gap="$2">
              <XStack gap="$4" alignItems="center">
                <Text fontWeight="$semibold" flexGrow={1}>
                  Version v{Application.nativeApplicationVersion}
                </Text>
                <MWButton
                  type="secondary"
                  backgroundColor="$sheetItemBackground"
                  icon={
                    <MaterialCommunityIcons
                      name={Platform.select({
                        ios: "apple",
                        android: "android",
                      })}
                      size={24}
                      color={theme.buttonSecondaryText.val}
                    />
                  }
                  iconAfter={
                    <>{mutation.isPending && <Spinner color="$purple200" />}</>
                  }
                  disabled={mutation.isPending}
                  onPress={() => mutation.mutate()}
                  animation="quicker"
                >
                  Update
                </MWButton>
              </XStack>
            </YStack>
          </YStack>

          {/* <XStack width={200} alignItems="center" gap="$4">
            <Text minWidth={110}>Theme</Text>
            <Separator minHeight={20} vertical />
            <ThemeSelector />
          </XStack>
          <XStack width={200} alignItems="center" gap="$4">
            <Text minWidth={110}>Gesture controls</Text>
            <Separator minHeight={20} vertical />
            <MWSwitch
              checked={gestureControls}
              onCheckedChange={handleGestureControlsToggle}
            >
              <MWSwitch.Thumb animation="quicker" />
            </MWSwitch>
          </XStack>
          <XStack width={200} alignItems="center" gap="$4">
            <Text minWidth={110}>Autoplay</Text>
            <Separator minHeight={20} vertical />
            <MWSwitch checked={autoPlay} onCheckedChange={setAutoPlay}>
              <MWSwitch.Thumb animation="quicker" />
            </MWSwitch>
          </XStack>
          <XStack width={200} alignItems="center" gap="$4">
            <Text minWidth={110}>v{Application.nativeApplicationVersion}</Text>
            <Separator minHeight={20} vertical />
            <MWButton
              type="secondary"
              backgroundColor="$sheetItemBackground"
              icon={
                <MaterialCommunityIcons
                  name={Platform.select({ ios: "apple", android: "android" })}
                  size={24}
                  color={theme.buttonSecondaryText.val}
                />
              }
              onPress={handleVersionPress}
            >
              Update
            </MWButton>
          </XStack> */}
        </YStack>
      </View>
      <UpdateSheet
        markdownContent={updateMarkdownContent}
        open={showUpdateSheet}
        setShowUpdateSheet={setShowUpdateSheet}
        downloadUrl={downloadUrl}
      />
    </ScreenLayout>
  );
}

export function UpdateSheet({
  markdownContent,
  open,
  setShowUpdateSheet,
  downloadUrl,
}: {
  markdownContent: string;
  open: boolean;
  setShowUpdateSheet: (value: boolean) => void;
  downloadUrl: string;
}) {
  const theme = useTheme();

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={setShowUpdateSheet}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      animationConfig={{
        type: "spring",
        damping: 20,
        mass: 1.2,
        stiffness: 250,
      }}
      snapPoints={[35]}
    >
      <Sheet.Handle backgroundColor="$sheetHandle" />
      <Sheet.Frame
        backgroundColor="$sheetBackground"
        padding="$4"
        alignItems="center"
        justifyContent="center"
      >
        <ScrollView>
          <Markdown
            style={{
              text: {
                color: "white",
              },
            }}
          >
            {markdownContent}
          </Markdown>
        </ScrollView>
        <MWButton
          type="secondary"
          backgroundColor="$sheetItemBackground"
          icon={
            <MaterialCommunityIcons
              name={Platform.select({ ios: "apple", android: "android" })}
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() => WebBrowser.openBrowserAsync(downloadUrl)}
        >
          Download
        </MWButton>
      </Sheet.Frame>
      <Sheet.Overlay
        animation="lazy"
        backgroundColor="rgba(0, 0, 0, 0.8)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
    </Sheet>
  );
}

export function ThemeSelector(props: SelectProps) {
  const theme = useTheme();
  const themeStore = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <MWSelect
      value={themeStore}
      onValueChange={setTheme}
      disablePreventBodyScroll
      {...props}
    >
      <MWSelect.Trigger
        maxWidth="$12"
        iconAfter={
          <FontAwesome name="chevron-down" color={theme.inputIconColor.val} />
        }
      >
        <Select.Value fontWeight="$semibold" textTransform="capitalize" />
      </MWSelect.Trigger>

      <Adapt platform="native">
        <Sheet
          modal
          dismissOnSnapToBottom
          dismissOnOverlayPress
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
          snapPoints={[35]}
        >
          <Sheet.Handle backgroundColor="$sheetHandle" />
          <Sheet.Frame
            backgroundColor="$sheetBackground"
            padding="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            backgroundColor="rgba(0, 0, 0, 0.8)"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content>
        <Select.Viewport
          animation="static"
          animateOnly={["transform", "opacity"]}
          enterStyle={{ o: 0, y: -10 }}
          exitStyle={{ o: 0, y: 10 }}
        >
          {themeOptions.map((item, i) => {
            return (
              <Select.Item
                index={i}
                key={item}
                value={item}
                backgroundColor="$sheetItemBackground"
                borderTopRightRadius={i === 0 ? "$8" : 0}
                borderTopLeftRadius={i === 0 ? "$8" : 0}
                borderBottomRightRadius={
                  i === themeOptions.length - 1 ? "$8" : 0
                }
                borderBottomLeftRadius={
                  i === themeOptions.length - 1 ? "$8" : 0
                }
              >
                <Select.ItemText
                  textTransform="capitalize"
                  fontWeight="$semibold"
                >
                  {item}
                </Select.ItemText>
                <Select.ItemIndicator ml="auto">
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={theme.sheetItemSelected.val}
                  />
                </Select.ItemIndicator>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </MWSelect>
  );
}
