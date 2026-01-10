import { useDevice, useDeviceStore, useNodeDB } from "@core/stores";
import { cn } from "@core/utils/cn";
import { create } from "@bufbuild/protobuf";
import { Protobuf } from "@meshtastic/core";
import { PlusIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

export const SimulationTool = () => {
  const { addNode, getMyNode, setNodeNum } = useNodeDB();
  const { setHardware, setConfig } = useDevice();
  const { default: map } = useMap();

  const handleAddNode = () => {
    try {
      if (!map) return;
      const center = map.getCenter();

      // Generate random 9-digit node ID
      const nodeId = Math.floor(Math.random() * 900000000) + 100000000;
      const shortName = nodeId.toString(16).slice(-4).toUpperCase();

      const node = create(Protobuf.Mesh.NodeInfoSchema, {
        num: nodeId,
        user: {
          id: `!${nodeId.toString(16)}`,
          longName: `Sim Node ${shortName}`,
          shortName: shortName,
          hwModel: Protobuf.Mesh.HardwareModel.TBEAM,
        },
        position: {
          latitudeI: Math.round(center.lat * 1e7),
          longitudeI: Math.round(center.lng * 1e7),
          altitude: 100,
        },
        lastHeard: Math.floor(Date.now() / 1000),
        snr: 10.0,
      });

      console.log("DEBUG: Calling addNode", node);
      addNode(node);
      
      const myNode = getMyNode();
      console.log("DEBUG: Current myNode:", myNode);

      // If we don't have a "myNode" (e.g. dev/sim mode), set this as identity
      if (!myNode) {
        console.log("DEBUG: Setting myNodeNum to:", nodeId);
        setNodeNum(nodeId);
        
        console.log("DEBUG: Calling setHardware...");
        setHardware(
          create(Protobuf.Mesh.MyNodeInfoSchema, {
            myNodeNum: nodeId,
          }),
        );
      }

      // Always ensure we have some config to unblock settings page
      console.log("DEBUG: Setting default configs. setConfig present?", !!setConfig);
      
      setConfig(
        create(Protobuf.Config.ConfigSchema, {
          payloadVariant: {
            case: "device",
            value: create(Protobuf.Config.Config_DeviceConfigSchema, {
              role: Protobuf.Config.Config_DeviceConfig_Role.CLIENT,
              serialEnabled: true,
            }),
          },
        }),
      );

      setConfig(
        create(Protobuf.Config.ConfigSchema, {
          payloadVariant: {
            case: "lora",
            value: create(Protobuf.Config.Config_LoRaConfigSchema, {
              region: Protobuf.Config.Config_LoRaConfig_RegionCode.US,
              usePreset: true,
              modemPreset: Protobuf.Config.Config_LoRaConfig_ModemPreset.LONG_FAST,
            }),
          },
        }),
      );

      setConfig(
        create(Protobuf.Config.ConfigSchema, {
          payloadVariant: {
            case: "display",
            value: create(Protobuf.Config.Config_DisplayConfigSchema),
          },
        }),
      );
      console.log("DEBUG: Configs set successfully");

      // Verify directly from store
      setTimeout(() => {
          const storeDevice = useDeviceStore.getState().getDevice(0);
          console.log(`[SimulationTool] Direct Store ACCESS Device 0 config: ${Object.keys(storeDevice?.config || {})}`);
      }, 500);
      
    } catch (e) {
      console.error("DEBUG: Error in handleAddNode:", e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddNode}
      className={cn(
        "rounded align-center",
        "w-[29px] px-1 py-1 shadow-l outline-[2px] outline-stone-600/20",
        "bg-stone-50 hover:bg-stone-200 dark:bg-stone-200 dark:hover:bg-stone-300 ",
        "text-slate-600 hover:text-slate-700",
        "dark:text-slate-600 hover:dark:text-slate-700",
      )}
      title="Add Mock Node"
    >
      <PlusIcon className="w-[21px]" />
    </button>
  );
};
