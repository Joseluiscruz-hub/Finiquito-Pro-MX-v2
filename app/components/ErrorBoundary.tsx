"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

/**
 * Captura errores de renderizado en el árbol de componentes hijo.
 * Muestra una UI de recuperación en lugar de dejar la pantalla en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return { hasError: true, message };
  }

  override componentDidCatch(error: unknown, info: { componentStack: string }) {
    // En producción reemplazar con tu proveedor de observabilidad (Sentry, etc.)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="validation-error" style={{ padding: "20px 24px" }}>
          <strong>Algo salió mal al renderizar este bloque.</strong>
          <p style={{ margin: "6px 0 12px", fontSize: "10px" }}>{this.state.message}</p>
          <button className="ghost-button" onClick={this.handleReset}>
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
