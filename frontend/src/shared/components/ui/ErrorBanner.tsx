interface ErrorBannerProps {
  mensaje: string
}

const ErrorBanner = ({ mensaje }: ErrorBannerProps) => (
  <p role="alert" className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-800 dark:text-red-200">
    {mensaje}
  </p>
)

export default ErrorBanner