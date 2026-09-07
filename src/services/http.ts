const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

export async function request<T>(path: string, options: Omit<UniApp.RequestOptions, 'url'> = {}) {
  const response = await uni.request({
    ...options,
    url: baseUrl + path,
    header: {
      'Content-Type': 'application/json',
      ...options.header,
    },
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error('Request failed: ' + response.statusCode)
  }

  return response.data as T
}
