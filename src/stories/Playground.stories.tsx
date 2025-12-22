import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StoryWrapper } from "./StoryWrapper";
import {
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  TimelineSettings,
  ViewConfiguration,
} from "../types";
import { ZoomMode } from "../enums";
import { defaultViewConfig } from "../constants/options";
import {
  PlaygroundTemplate,
  playgroundTemplates,
} from "./playground-templates";
import { colorToHex } from "./helpers/colorToHex";

// Playground Controls Component
const PlaygroundControls: React.FC<{
  settings: TimelineSettings<TimelineEvent, TimelineMarker, TimelineSection>;
  viewConfiguration: ViewConfiguration;
  onSettingsChange: (
    settings: TimelineSettings<TimelineEvent, TimelineMarker, TimelineSection>,
  ) => void;
  onViewConfigChange: (viewConfig: ViewConfiguration) => void;
  onExportCode: () => void;
}> = ({
  settings,
  viewConfiguration,
  onSettingsChange,
  onViewConfigChange,
  onExportCode,
}) => {
  const [activeTab, setActiveTab] = useState<
    "templates" | "events" | "markers" | "sections" | "axes" | "view" | "camera"
  >("templates");

  const applyTemplate = useCallback(
    (template: PlaygroundTemplate) => {
      onSettingsChange(template.settings);
      onViewConfigChange(template.viewConfiguration);
    },
    [onSettingsChange, onViewConfigChange],
  );

  const addEvent = useCallback(() => {
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      axisId: settings.axes[0]?.id || "axis1",
      trackIndex: 0,
      from: Date.now(),
      to: Date.now() + 3600000, // 1 hour
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };

    onSettingsChange({
      ...settings,
      events: [...settings.events, newEvent],
    });
  }, [settings, onSettingsChange]);

  const removeEvent = useCallback(
    (eventId: string) => {
      onSettingsChange({
        ...settings,
        events: settings.events.filter((e) => e.id !== eventId),
      });
    },
    [settings, onSettingsChange],
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<TimelineEvent>) => {
      onSettingsChange({
        ...settings,
        events: settings.events.map((e) =>
          e.id === eventId ? { ...e, ...updates } : e,
        ),
      });
    },
    [settings, onSettingsChange],
  );

  const addAxis = useCallback(() => {
    const newAxis = {
      id: `axis-${Date.now()}`,
      tracksCount: 3,
      top: settings.axes.length * 120,
      height: 100,
    };

    onSettingsChange({
      ...settings,
      axes: [...settings.axes, newAxis],
    });
  }, [settings, onSettingsChange]);

  const removeAxis = useCallback(
    (axisId: string) => {
      onSettingsChange({
        ...settings,
        axes: settings.axes.filter((a) => a.id !== axisId),
        events: settings.events.filter((e) => e.axisId !== axisId),
      });
    },
    [settings, onSettingsChange],
  );

  const addSection = useCallback(() => {
    const newSection: TimelineSection = {
      id: `section-${Date.now()}`,
      from: Date.now(),
      to: Date.now() + 3600000, // 1 hour
      color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
    };

    onSettingsChange({
      ...settings,
      sections: [...(settings.sections || []), newSection],
    });
  }, [settings, onSettingsChange]);

  const removeSection = useCallback(
    (sectionId: string) => {
      onSettingsChange({
        ...settings,
        sections: (settings.sections || []).filter((s) => s.id !== sectionId),
      });
    },
    [settings, onSettingsChange],
  );

  const updateSection = useCallback(
    (sectionId: string, updates: Partial<TimelineSection>) => {
      onSettingsChange({
        ...settings,
        sections: (settings.sections || []).map((s) =>
          s.id === sectionId ? { ...s, ...updates } : s,
        ),
      });
    },
    [settings, onSettingsChange],
  );

  const addMarker = useCallback(() => {
    const baseColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    const newMarker: TimelineMarker = {
      time: Date.now(),
      color: baseColor,
      activeColor: baseColor,
      hoverColor: baseColor,
      label: `Marker ${(settings.markers?.length || 0) + 1}`,
    };

    onSettingsChange({
      ...settings,
      markers: [...(settings.markers || []), newMarker],
    });
  }, [settings, onSettingsChange]);

  const removeMarker = useCallback(
    (index: number) => {
      onSettingsChange({
        ...settings,
        markers: (settings.markers || []).filter((_, i) => i !== index),
      });
    },
    [settings, onSettingsChange],
  );

  const updateMarker = useCallback(
    (index: number, updates: Partial<TimelineMarker>) => {
      onSettingsChange({
        ...settings,
        markers: (settings.markers || []).map((m, i) =>
          i === index ? { ...m, ...updates } : m,
        ),
      });
    },
    [settings, onSettingsChange],
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        minWidth: "300px",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
          Timeline Playground
        </h3>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              "templates",
              "events",
              "markers",
              "sections",
              "axes",
              "view",
              "camera",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: activeTab === tab ? "#007acc" : "white",
                color: activeTab === tab ? "white" : "#333",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div>
            <div style={{ marginBottom: "12px" }}>
              <p
                style={{ fontSize: "12px", color: "#666", margin: "0 0 8px 0" }}
              >
                Choose a ready-made template for quick start:
              </p>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {playgroundTemplates.map((template) => (
                <div
                  key={template.name}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "8px",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => applyTemplate(template)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#007acc";
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#eee";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "4px",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "13px" }}>
                        {template.name}
                      </strong>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginTop: "2px",
                          textTransform: "capitalize",
                        }}
                      >
                        {template.category}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyTemplate(template);
                      }}
                      style={{
                        background: "#007acc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                    >
                      Apply
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: "11px",
                      color: "#555",
                      margin: "0",
                      lineHeight: "1.4",
                    }}
                  >
                    {template.description}
                  </p>

                  <div
                    style={{
                      fontSize: "10px",
                      color: "#888",
                      marginTop: "6px",
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>Axes: {template.settings.axes.length}</span>
                    <span>Events: {template.settings.events.length}</span>
                    {template.settings.sections &&
                      template.settings.sections.length > 0 && (
                        <span>
                          Sections: {template.settings.sections.length}
                        </span>
                      )}
                    {template.settings.markers &&
                      template.settings.markers.length > 0 && (
                        <span>Markers: {template.settings.markers.length}</span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                onClick={addEvent}
                style={{
                  padding: "6px 12px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                + Add Event
              </button>
              <button
                onClick={onExportCode}
                style={{
                  padding: "6px 12px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Export Code
              </button>
            </div>

            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {settings.events.map((event, _) => (
                <div
                  key={event.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    padding: "8px",
                    marginBottom: "8px",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{event.id}</strong>
                    <button
                      onClick={() => removeEvent(event.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        padding: "2px 6px",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px",
                    }}
                  >
                    <input
                      type="color"
                      value={colorToHex(event.color)}
                      onChange={(e) =>
                        updateEvent(event.id, { color: e.target.value })
                      }
                      style={{ width: "100%", height: "24px" }}
                    />
                    <select
                      value={event.axisId}
                      onChange={(e) =>
                        updateEvent(event.id, { axisId: e.target.value })
                      }
                      style={{ fontSize: "11px", padding: "2px" }}
                    >
                      {settings.axes.map((axis) => (
                        <option key={axis.id} value={axis.id}>
                          {axis.id}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Track"
                      value={event.trackIndex}
                      onChange={(e) =>
                        updateEvent(event.id, {
                          trackIndex: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      style={{ fontSize: "11px", padding: "2px" }}
                    />
                    <input
                      type="number"
                      placeholder="Duration (ms)"
                      value={event.to ? event.to - event.from : ""}
                      onChange={(e) => {
                        const duration = parseInt(e.target.value, 10) || 0;
                        updateEvent(event.id, { to: event.from + duration });
                      }}
                      style={{ fontSize: "11px", padding: "2px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markers Tab */}
        {activeTab === "markers" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                onClick={addMarker}
                style={{
                  padding: "6px 12px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                + Add Marker
              </button>
            </div>

            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {(settings.markers || []).map((marker, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    padding: "8px",
                    marginBottom: "8px",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{marker.label || `Marker ${index + 1}`}</strong>
                    <button
                      onClick={() => removeMarker(index)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        padding: "2px 6px",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px",
                    }}
                  >
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "10px", color: "#666" }}>
                        Label:
                      </label>
                      <input
                        type="text"
                        value={marker.label || ""}
                        onChange={(e) =>
                          updateMarker(index, { label: e.target.value })
                        }
                        placeholder="Marker label"
                        style={{
                          fontSize: "11px",
                          padding: "2px",
                          width: "100%",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", color: "#666" }}>
                        Color:
                      </label>
                      <input
                        type="color"
                        value={colorToHex(marker.color)}
                        onChange={(e) =>
                          updateMarker(index, {
                            color: e.target.value,
                            activeColor: e.target.value,
                            hoverColor: e.target.value,
                          })
                        }
                        style={{ width: "100%", height: "24px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", color: "#666" }}>
                        Time (offset min):
                      </label>
                      <input
                        type="number"
                        value={Math.round((marker.time - Date.now()) / 60000)}
                        onChange={(e) => {
                          const offsetMinutes =
                            parseInt(e.target.value, 10) || 0;
                          updateMarker(index, {
                            time: Date.now() + offsetMinutes * 60000,
                          });
                        }}
                        style={{
                          fontSize: "11px",
                          padding: "2px",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!settings.markers || settings.markers.length === 0) && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  No markers yet. Click &#34;+ Add Marker&#34; to create one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === "sections" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                onClick={addSection}
                style={{
                  padding: "6px 12px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                + Add Section
              </button>
            </div>

            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {(settings.sections || []).map((section) => (
                <div
                  key={section.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    padding: "8px",
                    marginBottom: "8px",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{section.id}</strong>
                    <button
                      onClick={() => removeSection(section.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        padding: "2px 6px",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px",
                    }}
                  >
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "10px", color: "#666" }}>
                        Color:
                      </label>
                      <input
                        type="color"
                        value={colorToHex(section.color)}
                        onChange={(e) => {
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          updateSection(section.id, {
                            color: `rgba(${r}, ${g}, ${b}, 0.3)`,
                            hoverColor: `rgba(${r}, ${g}, ${b}, 0.4)`,
                          });
                        }}
                        style={{ width: "100%", height: "24px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", color: "#666" }}>
                        From (offset min):
                      </label>
                      <input
                        type="number"
                        value={Math.round((section.from - Date.now()) / 60000)}
                        onChange={(e) => {
                          const offsetMinutes =
                            parseInt(e.target.value, 10) || 0;
                          updateSection(section.id, {
                            from: Date.now() + offsetMinutes * 60000,
                          });
                        }}
                        style={{
                          fontSize: "11px",
                          padding: "2px",
                          width: "100%",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", color: "#666" }}>
                        To (offset min):
                      </label>
                      <input
                        type="number"
                        value={
                          section.to
                            ? Math.round((section.to - Date.now()) / 60000)
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            updateSection(section.id, { to: undefined });
                          } else {
                            const offsetMinutes = parseInt(value, 10) || 0;
                            updateSection(section.id, {
                              to: Date.now() + offsetMinutes * 60000,
                            });
                          }
                        }}
                        placeholder="∞"
                        style={{
                          fontSize: "11px",
                          padding: "2px",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!settings.sections || settings.sections.length === 0) && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  No sections yet. Click &#34;+ Add Section&#34; to create one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Axes Tab */}
        {activeTab === "axes" && (
          <div>
            <button
              onClick={addAxis}
              style={{
                padding: "6px 12px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                marginBottom: "12px",
              }}
            >
              + Add Axis
            </button>

            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {settings.axes.map((axis, _) => (
                <div
                  key={axis.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    padding: "8px",
                    marginBottom: "8px",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{axis.id}</strong>
                    <button
                      onClick={() => removeAxis(axis.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        padding: "2px 6px",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px",
                    }}
                  >
                    <input
                      type="number"
                      placeholder="Tracks Count"
                      value={axis.tracksCount}
                      onChange={(e) => {
                        const newAxes = settings.axes.map((a) =>
                          a.id === axis.id
                            ? {
                                ...a,
                                tracksCount: parseInt(e.target.value, 10) || 1,
                              }
                            : a,
                        );
                        onSettingsChange({ ...settings, axes: newAxes });
                      }}
                      style={{ fontSize: "11px", padding: "2px" }}
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={axis.height}
                      onChange={(e) => {
                        const newAxes = settings.axes.map((a) =>
                          a.id === axis.id
                            ? {
                                ...a,
                                height: parseInt(e.target.value, 10) || 100,
                              }
                            : a,
                        );
                        onSettingsChange({ ...settings, axes: newAxes });
                      }}
                      style={{ fontSize: "11px", padding: "2px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Tab */}
        {activeTab === "view" && (
          <div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                Hide Ruler:
                <input
                  type="checkbox"
                  checked={viewConfiguration.hideRuler}
                  onChange={(e) =>
                    onViewConfigChange({
                      ...viewConfiguration,
                      hideRuler: e.target.checked,
                    })
                  }
                  style={{ marginLeft: "8px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                Primary Grid Color:
                <input
                  type="color"
                  value={
                    viewConfiguration.grid.color?.primaryMarkColor || "#cccccc"
                  }
                  onChange={(e) =>
                    onViewConfigChange({
                      ...viewConfiguration,
                      grid: {
                        ...viewConfiguration.grid,
                        color: {
                          ...viewConfiguration.grid.color,
                          primaryMarkColor: e.target.value,
                        },
                      },
                    })
                  }
                  style={{ marginLeft: "8px", width: "40px", height: "20px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                Events Font:
                <input
                  type="text"
                  value={viewConfiguration.events.font}
                  onChange={(e) =>
                    onViewConfigChange({
                      ...viewConfiguration,
                      events: {
                        ...viewConfiguration.events,
                        font: e.target.value,
                      },
                    })
                  }
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    padding: "2px",
                    width: "120px",
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Camera Tab */}
        {activeTab === "camera" && (
          <div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                Zoom Mode:
                <select
                  value={viewConfiguration.camera?.zoom || ZoomMode.DEFAULT}
                  onChange={(e) =>
                    onViewConfigChange({
                      ...viewConfiguration,
                      camera: { zoom: e.target.value as ZoomMode },
                    })
                  }
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    padding: "2px",
                  }}
                >
                  {Object.entries(ZoomMode).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "11px", color: "#666", margin: "0" }}>
                Additional camera settings are available through Timeline API
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Playground Component
const PlaygroundComponent: React.FC = () => {
  const [settings, setSettings] = useState<
    TimelineSettings<TimelineEvent, TimelineMarker, TimelineSection>
  >({
    start: Date.now() - 86400000, // 1 day ago
    end: Date.now() + 86400000, // 1 day from now
    axes: [
      {
        id: "axis1",
        tracksCount: 3,
        top: 0,
        height: 100,
      },
    ],
    events: [
      {
        id: "event1",
        axisId: "axis1",
        trackIndex: 0,
        from: Date.now() - 3600000,
        to: Date.now() - 1800000,
        color: "#ff6b6b",
      },
      {
        id: "event2",
        axisId: "axis1",
        trackIndex: 1,
        from: Date.now() - 1800000,
        to: Date.now(),
        color: "#4ecdc4",
      },
      {
        id: "event3",
        axisId: "axis1",
        trackIndex: 2,
        from: Date.now(),
        to: Date.now() + 3600000,
        color: "#45b7d1",
      },
    ],
    selectedEventIds: [],
  });

  const [viewConfiguration, setViewConfiguration] =
    useState<ViewConfiguration>(defaultViewConfig);

  const handleExportCode = useCallback(() => {
    const code = `import { Timeline } from '@gravity-ui/timeline';

const timeline = new Timeline({
  settings: ${JSON.stringify(settings, null, 2)},
  viewConfiguration: ${JSON.stringify(viewConfiguration, null, 2)}
});

// Add to your React component
timeline.mount(containerRef.current);`;

    // Create a temporary textarea to copy the code
    const textarea = document.createElement("textarea");
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Show a temporary notification
    const notification = document.createElement("div");
    notification.textContent = "Code copied to clipboard!";
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #28a745;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  }, [settings, viewConfiguration]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <PlaygroundControls
        settings={settings}
        viewConfiguration={viewConfiguration}
        onSettingsChange={setSettings}
        onViewConfigChange={setViewConfiguration}
        onExportCode={handleExportCode}
      />

      <StoryWrapper
        {...Object.entries(settings).reduce((acc, [key, value]) => {
          acc[`settings.${key}`] = value;
          return acc;
        }, {} as any)}
        {...Object.entries(viewConfiguration).reduce((acc, [key, value]) => {
          acc[`viewConfiguration.${key}`] = value;
          return acc;
        }, {} as any)}
      />
    </div>
  );
};

const meta = {
  title: "Playground",
  component: PlaygroundComponent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const InteractivePlayground: Story = {
  name: "Default",
  render: () => <PlaygroundComponent />,
};
