import Fastify from 'fastify'
import cors from '@fastify/cors'
import { randomUUID } from 'node:crypto'

type OrderStatus = 'pending' | 'in_kitchen' | 'served' | 'cancelled'

interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  notes?: string
}

interface Order {
  id: string
  tableId: string
  sessionId?: string
  restaurantId?: string
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

const orders: Order[] = []

const fastify = Fastify({
  logger: true,
})

async function buildServer() {
  await fastify.register(cors, {
    origin: true,
  })

  fastify.get('/health', async () => {
    return { status: 'ok' }
  })

  fastify.get('/orders', async (request) => {
    const query = request.query as {
      status?: OrderStatus
    }

    if (query.status) {
      return orders.filter((o) => o.status === query.status)
    }
    return orders
  })

  fastify.get('/kitchen/orders', async (request) => {
    const query = request.query as {
      status?: OrderStatus
    }

    const targetStatus: OrderStatus = query.status ?? 'pending'
    return orders.filter((o) => o.status === targetStatus)
  })

  fastify.post('/orders', async (request, reply) => {
    const body = request.body as {
      tableId: string
      sessionId?: string
      restaurantId?: string
      items: {
        menuItemId: string
        name: string
        quantity: number
        notes?: string
      }[]
    }

    if (!body?.tableId || !Array.isArray(body.items) || body.items.length === 0) {
      return reply.status(400).send({ error: 'tableId e items son requeridos' })
    }

    const now = new Date().toISOString()

    const order: Order = {
      id: randomUUID(),
      tableId: body.tableId,
      sessionId: body.sessionId,
      restaurantId: body.restaurantId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      items: body.items.map((item) => ({
        id: randomUUID(),
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
      })),
    }

    orders.push(order)
    return order
  })

  fastify.patch('/orders/:id', async (request, reply) => {
    const params = request.params as { id: string }
    const body = request.body as { status?: OrderStatus }

    const order = orders.find((o) => o.id === params.id)
    if (!order) {
      return reply.status(404).send({ error: 'Orden no encontrada' })
    }

    if (body.status) {
      order.status = body.status
      order.updatedAt = new Date().toISOString()
    }

    return order
  })

  return fastify
}

buildServer()
  .then((app) => {
    const port = Number(process.env.PORT) || 4000
    app.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        app.log.error(err)
        process.exit(1)
      }
      app.log.info(`Operations service listening at ${address}`)
    })
  })
  .catch((err) => {
    console.error('Error starting operations service', err)
    process.exit(1)
  })

