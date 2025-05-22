/**
 * Base interface for timeline components
 */
export interface BaseComponentInterface {
  render(): void;
  destroy?(): void;
}
