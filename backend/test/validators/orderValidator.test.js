const { validateCreateOrder, validateUpdateOrder, validateUpdateOrderStatus, validatePayOrder } = require('../../src/validators/orderValidator')

describe('Order Validator', () => {
  const validOrder = {
    tableNumber: 1,
    items: [{ menuItem: { name: 'Pho bo', price: 50000 }, quantity: 2 }],
  }

  describe('validateCreateOrder', () => {
    test('1. should return no errors for valid order', () => {
      const errors = validateCreateOrder(validOrder)
      expect(errors).toEqual([])
    })

    test('2. should return error when tableNumber is missing', () => {
      const body = { items: validOrder.items }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('3. should return error when tableNumber is negative', () => {
      const body = { ...validOrder, tableNumber: -1 }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('4. should return error when tableNumber is 0', () => {
      const body = { ...validOrder, tableNumber: 0 }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('5. should return error when items is missing', () => {
      const body = { tableNumber: 1 }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('6. should return error when items is empty array', () => {
      const body = { tableNumber: 1, items: [] }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('7. should return error when item has no menuItem', () => {
      const body = { tableNumber: 1, items: [{ quantity: 1 }] }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('8. should return error when menuItem has no name', () => {
      const body = { tableNumber: 1, items: [{ menuItem: { price: 50000 }, quantity: 1 }] }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('9. should return error when menuItem price is negative', () => {
      const body = { tableNumber: 1, items: [{ menuItem: { name: 'Pho', price: -100 }, quantity: 1 }] }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('10. should return error when quantity less than 1', () => {
      const body = { tableNumber: 1, items: [{ menuItem: { name: 'Pho', price: 50000 }, quantity: 0 }] }
      const errors = validateCreateOrder(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    test('11. should accept order with multiple valid items', () => {
      const body = {
        tableNumber: 5,
        items: [
          { menuItem: { name: 'Pho', price: 50000 }, quantity: 2 },
          { menuItem: { name: 'Nuoc', price: 25000 }, quantity: 3 },
        ],
      }
      const errors = validateCreateOrder(body)
      expect(errors).toEqual([])
    })
  })

  describe('validateUpdateOrderStatus', () => {
    test('12. should accept valid status preparing', () => {
      expect(validateUpdateOrderStatus({ status: 'preparing' })).toEqual([])
    })

    test('13. should accept valid status serving', () => {
      expect(validateUpdateOrderStatus({ status: 'serving' })).toEqual([])
    })

    test('14. should accept valid status completed', () => {
      expect(validateUpdateOrderStatus({ status: 'completed' })).toEqual([])
    })

    test('15. should return error when status is missing', () => {
      const errors = validateUpdateOrderStatus({})
      expect(errors.length).toBeGreaterThan(0)
    })

    test('16. should return error when status is invalid', () => {
      const errors = validateUpdateOrderStatus({ status: 'cancelled' })
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('validatePayOrder', () => {
    test('17. should return no errors when discount is valid', () => {
      expect(validatePayOrder({ discount: 10 })).toEqual([])
    })

    test('18. should return no errors when no discount', () => {
      expect(validatePayOrder({})).toEqual([])
    })

    test('19. should return error when discount is negative', () => {
      const errors = validatePayOrder({ discount: -5 })
      expect(errors.length).toBeGreaterThan(0)
    })

    test('20. should return error when discount greater than 100', () => {
      const errors = validatePayOrder({ discount: 150 })
      expect(errors.length).toBeGreaterThan(0)
    })

    test('21. should accept discount of 0 and 100', () => {
      expect(validatePayOrder({ discount: 0 })).toEqual([])
      expect(validatePayOrder({ discount: 100 })).toEqual([])
    })
  })
})