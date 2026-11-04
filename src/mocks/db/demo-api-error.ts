const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  503: 'Service Unavailable',
}

export class DemoApiError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'DemoApiError'
    this.statusCode = statusCode
  }

  toBody() {
    return {
      statusCode: this.statusCode,
      error: STATUS_TEXT[this.statusCode] ?? 'Error',
      message: this.message,
    }
  }
}

export const notFound = (entity: string, id: string) =>
  new DemoApiError(404, `${entity} ${id} not found`)

export const conflict = (message: string) => new DemoApiError(409, message)

export const unprocessable = (message: string) => new DemoApiError(422, message)
