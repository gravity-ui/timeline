/**
 * Base interface for timeline components
 */
export interface BaseComponentInterface {
  render(): void;
  rebuildIndex?(): void;
  destroy?(): void;
}
