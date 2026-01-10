import { useDeviceContext } from "@core/hooks/useDeviceContext.ts";
import { type Device, useDeviceStore } from "@core/stores/deviceStore/index.ts";
import {
  type MessageStore,
  useMessageStore,
} from "@core/stores/messageStore/index.ts";
import { type NodeDB, useNodeDBStore } from "@core/stores/nodeDBStore/index.ts";
import { bindStoreToDevice } from "@core/stores/utils/bindStoreToDevice.ts";

export {
  CurrentDeviceContext,
  type DeviceContext,
  useDeviceContext,
} from "@core/hooks/useDeviceContext";
export { useAppStore } from "@core/stores/appStore/index.ts";
export { type Device, useDeviceStore } from "@core/stores/deviceStore/index.ts";
export {
  useActiveConnection,
  useActiveConnectionId,
  useAddSavedConnection,
  useConnectionError,
  useConnectionForDevice,
  useConnectionStatus,
  useDefaultConnection,
  useDeviceForConnection,
  useFirstSavedConnection,
  useIsConnected,
  useIsConnecting,
  useRemoveSavedConnection,
  useSavedConnections,
  useUpdateSavedConnection,
} from "@core/stores/deviceStore/selectors.ts";
export type {
  Page,
  ValidConfigType,
  ValidModuleConfigType,
  WaypointWithMetadata,
} from "@core/stores/deviceStore/types.ts";
export {
  MessageState,
  type MessageStore,
  MessageType,
  useMessageStore,
} from "@core/stores/messageStore";
export { type NodeDB, useNodeDBStore } from "@core/stores/nodeDBStore/index.ts";
export type { NodeErrorType } from "@core/stores/nodeDBStore/types.ts";
export {
  SidebarProvider,
  useSidebar, // TODO: Bring hook into this file
} from "@core/stores/sidebarStore/index.tsx";

// Re-export idb-keyval functions for clearing all stores, expand this if we add more local storage types
export { clear as clearAllStores } from "idb-keyval";

// Define hooks to access the stores
export const useNodeDB = bindStoreToDevice(
  useNodeDBStore,
  (s, deviceId): NodeDB => s.getNodeDB(deviceId) ?? s.addNodeDB(deviceId),
);

export const useDevice = (): Device => {
  const { deviceId } = useDeviceContext();

  const device = useDeviceStore((s) => s.getDevice(deviceId));
  const addDevice = useDeviceStore((s) => s.addDevice);
  
  // This side-effect during render is still not ideal but cleaner than inside selector.
  // Ideally DeviceWrapper ensures device exists.
  if (!device) {
     console.warn(`[useDevice] Device ${deviceId} missing, adding it now.`);
     return addDevice(deviceId);
  }
  
  // Keep the log for now to verify fix
  if (device && Object.keys(device.config || {}).length > 2) {
      // console.log(`[useDevice] Device ${deviceId} has full config:`, Object.keys(device.config));
  } else if (device) {
      console.log(`[useDevice] Device ${deviceId} has limited config:`, Object.keys(device.config || {}));
  }
  
  return device;
};

export const useMessages = (): MessageStore => {
  const { deviceId } = useDeviceContext();

  const device = useMessageStore(
    (s) => s.getMessageStore(deviceId) ?? s.addMessageStore(deviceId),
  );
  return device;
};
