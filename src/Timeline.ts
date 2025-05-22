import {
  TimeLineConfig,
  TimelineSettings,
  ViewConfigurationDefault,
} from "./types/configuration";
import { Axes } from "./newComponents/Axes";
import { Ruler } from "./newComponents/Ruler";
import { Grid } from "./newComponents/Grid";
import { Events } from "./newComponents/Events";
import { defaultViewConfig } from "./constants/options";
import { CanvasApi } from "./CanvasApi";
import { TimelineController } from "./TimelineController";
import { ComponentType } from "./enums";
import { Markers } from "./newComponents/Markers";

export class Timeline {
  public canvasScrollTop: number;
  public settings: TimelineSettings;
  public viewConfiguration: ViewConfigurationDefault;
  public api: CanvasApi;
  public canvas: HTMLCanvasElement;

  private controller: TimelineController;

  constructor(config: TimeLineConfig) {
    this.viewConfiguration = config.viewConfiguration
      ? ({
          ...defaultViewConfig,
          ...config.viewConfiguration,
        } as ViewConfigurationDefault)
      : defaultViewConfig;

    this.settings = config.settings;
  }

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasScrollTop = 0;

    this.api = new CanvasApi(this);
    // init components
    this.api.addComponent(ComponentType.Grid, new Grid(this.api));
    this.api.addComponent(ComponentType.Axes, new Axes(this.api));
    this.api.addComponent(ComponentType.Events, new Events(this.api));
    if (!this.viewConfiguration.hideRuler) {
      this.api.addComponent(ComponentType.Ruler, new Ruler(this.api));
    }
    this.api.addComponent(ComponentType.Markers, new Markers(this.api));

    this.api.setAxes(this.settings.axes);
    this.api.setEvents(this.settings.events);

    this.controller = new TimelineController(this.api);
  }

  public destroy() {
    this.controller.destroy();
    this.api.destroy();
  }
}
