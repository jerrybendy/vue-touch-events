import {PluginObject} from "vue";

declare const Vue2TouchEvents: PluginObject<Vue2TouchEventsOptions>;

export interface Vue2TouchEventsOptions {
  disableClick?: boolean;
  touchClass?: string;
  tapTolerance?: number;
  swipeTolerance?: number;
  longTapTimeInterval?: number;
}

export default Vue2TouchEvents;
