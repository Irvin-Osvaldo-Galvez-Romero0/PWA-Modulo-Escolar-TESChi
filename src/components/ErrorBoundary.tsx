import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Cumplimiento ISO 9241-110 (Tolerancia y Prevención de Errores)
 * Captura excepciones no controladas en el ciclo de vida de React y proporciona
 * una interfaz de recuperación accesible con opción de reintentar.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[ErrorBoundary] Error capturado en el árbol de componentes:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-2xl border border-red-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#191c1d]">
              {this.props.fallbackTitle || 'Ocurrió un inconveniente al cargar la vista'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              El sistema ha contenido el fallo de forma segura bajo la norma ISO 9241-110. Puedes reintentar la operación.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-semibold rounded-xl transition active:scale-95 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar carga</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
