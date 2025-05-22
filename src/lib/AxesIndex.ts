import { TimelineAxis } from "../types/axis";

/**
 * Utility function to compare two arrays for equality
 */
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * A class for indexing and managing timeline axes with sorting and ID-based lookup capabilities
 * @template Axis - The axis type extending TimelineAxis
 */
export class AxesIndex<Axis extends TimelineAxis = TimelineAxis> {
  private _axes: Axis[] = [];
  private _sortedAxes: Axis[] | undefined;
  private _axesByIdMap: Record<string, Axis> | undefined;

  /**
   * Creates an AxesIndex instance
   * @param axes - Array of axes to initialize with
   * @param options - Configuration options
   * @param options.identityFunction - Custom function to get axis identifier
   */
  constructor(
    axes: Axis[] = [],
    options?: { identityFunction?: (axis: Axis) => string },
  ) {
    this.axes = axes;

    if (options?.identityFunction) {
      this.getAxisId = options.identityFunction;
    }
  }

  /**
   * Gets the identifier for an axis
   * @param axis - The axis object
   * @returns The axis identifier
   * @throws Will throw an error if axis has no valid identifier
   */
  public getAxisId(axis: Axis): string {
    const id = axis.id;
    if (!id) {
      throw new Error("Axis must have a non-empty id property");
    }
    return id;
  }

  /**
   * Sets the axes array and invalidates cached indexes
   */
  public set axes(newAxes: Axis[]) {
    if (!arraysEqual(newAxes, this._axes)) {
      this._axes = newAxes;
      this._sortedAxes = undefined;
      this._axesByIdMap = undefined;
    }
  }

  /**
   * Gets the raw axes array
   */
  public get axes(): Axis[] {
    return this._axes;
  }

  /**
   * Gets axes sorted by their top position
   */
  public get sortedAxes(): Axis[] {
    if (!this._sortedAxes) {
      // Create a new sorted array without modifying the original
      this._sortedAxes = this._axes.slice().sort((a, b) => a.top - b.top);
    }
    return this._sortedAxes;
  }

  /**
   * Gets a map of axes by their IDs
   */
  public get axesById(): Record<string, Axis> {
    if (!this._axesByIdMap) {
      this._axesByIdMap = this._axes.reduce(
        (acc, axis) => {
          // eslint-disable-next-line no-param-reassign
          acc[this.getAxisId(axis)] = axis;
          return acc;
        },
        {} as Record<string, Axis>,
      );
    }
    return this._axesByIdMap;
  }

  /**
   * Gets an axis by its ID
   * @param id - The axis ID to look up
   * @returns The axis if found, otherwise undefined
   */
  public getAxisById(id: string): Axis | undefined {
    return this.axesById[id];
  }

  /**
   * Checks if an axis with the given ID exists
   * @param id - The axis ID to check
   * @returns True if axis exists, false otherwise
   */
  public hasAxis(id: string): boolean {
    return id in this.axesById;
  }
}
