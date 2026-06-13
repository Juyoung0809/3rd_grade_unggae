type TossPaymentMethod =
  | '카드'
  | '가상계좌'
  | '계좌이체'
  | '휴대폰'
  | '문화상품권'
  | '도서문화상품권'
  | '게임문화상품권'
  | '카카오페이'
  | '네이버페이'
  | '삼성페이'
  | '토스페이'
  | '엘페이'
  | '페이코'
  | '애플페이'

interface TossPaymentRequestParams {
  amount: number
  orderId: string
  orderName: string
  customerName?: string
  customerEmail?: string
  successUrl: string
  failUrl: string
}

interface TossPaymentsInstance {
  requestPayment(method: TossPaymentMethod, params: TossPaymentRequestParams): Promise<void>
}

interface Window {
  TossPayments: (clientKey: string) => TossPaymentsInstance
}
