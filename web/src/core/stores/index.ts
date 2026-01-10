import { useDeviceContext } from "@core/hooks/useDeviceContext.ts";
import { type Device, useDeviceStore } from "./deviceStore";
import { type NodeDB, useNodeDBStore } from "./nodeDBStore";
import {
  type MessageStore,
  useMessageStore,
} from "./messageStore";
import { bindStoreToDevice } from "./utils/bindStoreToDevice";

export {
  CurrentDeviceContext,
  type DeviceContext,
  useDeviceContext,
} from "@core/hooks/useDeviceContext";
export { useAppStore } from "./appStore";
export { type Device, useDeviceStore } from "./deviceStore";
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
} from "./deviceStore/selectors";
export type {
  Connection,
  ConnectionStatus,
  ConnectionType,
  NewConnection,
  Page,
  ValidConfigType,
  ValidModuleConfigType,
  WaypointWithMetadata,
} from "./deviceStore/types";
export {
  MessageState,
  type MessageStore,
  MessageType,
  useMessageStore,
} from "./messageStore";
export { type NodeDB, useNodeDBStore } from "./nodeDBStore";
export type { NodeErrorType } from "./nodeDBStore/types";
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

  const device = useDeviceStore((s) => s.devices.get(deviceId));
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
