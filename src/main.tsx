import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";

// Global Error Boundary to prevent blank white page
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("App crashed:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#FAFBFA",
                    fontFamily: "sans-serif",
                    padding: "2rem",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: 48 }}>⚠️</div>
                    <h1 style={{ color: "#1E2A2A", marginTop: 16 }}>Algo deu errado</h1>
                    <p style={{ color: "#64748b", maxWidth: 400 }}>
                        {this.state.error?.message ?? "Erro desconhecido ao inicializar o app."}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: 24,
                            background: "#3D7A6F",
                            color: "white",
                            border: "none",
                            borderRadius: 999,
                            padding: "12px 32px",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Recarregar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
