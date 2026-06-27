import { useEffect, useState } from 'react'
import './App.css'

const DJANGO_API_BASE = 'https://avisame.onrender.com'
const OPS_SERVICE_BASE = 'http://localhost:4000'

type MenuItem = {
  id: string
  name: string
  description: string
  price: string 
  category_name: string
}

type TableInfo = {
  id: string
  table_number: string
}

type ScanQrResponse = {
  restaurant: { id: string; name: string }
  table: TableInfo
  session_id?: string
}

type Order = {
  id: string
  tableId: string
  status: 'pending' | 'in_kitchen' | 'served' | 'cancelled'
  createdAt: string
  items: {
    id: string
    name: string
    quantity: number
    notes?: string
  }[]
}

function WaiterModule() {
  type TableWithStatus = TableInfo & {
    status: 'available' | 'occupied' | 'requested'
  }

  type ActiveRequest = {
    id: string
    request_type: 'call_waiter' | 'bill' | 'menu' | 'other'
    status: string
    notes: string
    created_at: string
  }

  const [tables, setTables] = useState<TableWithStatus[]>([])
  const [selectedTable, setSelectedTable] = useState<TableWithStatus | null>(null)
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  async function loadTables() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${DJANGO_API_BASE}/api/tables/`)
      if (!res.ok) {
        throw new Error('No se pudieron cargar las mesas')
      }
      const raw = await res.json()
      const data: TableWithStatus[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.results)
          ? raw.results
          : []
      setTables(data)
    } catch (err: any) {
      setMessage(err.message || 'Error cargando mesas')
    } finally {
      setLoading(false)
    }
  }

  async function loadActiveRequest(table: TableWithStatus) {
    setSelectedTable(table)
    setActiveRequest(null)
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(
        `${DJANGO_API_BASE}/api/tables/${table.id}/active-request/`,
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'No se pudo obtener la solicitud')
      }
      const data = await res.json()
      if (data.has_active_request && data.request) {
        setActiveRequest(data.request as ActiveRequest)
      } else {
        setMessage('La mesa no tiene solicitudes pendientes')
      }
    } catch (err: any) {
      setMessage(err.message || 'Error obteniendo solicitud')
    } finally {
      setLoading(false)
    }
  }

  async function markRequestCompleted() {
    if (!activeRequest) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(
        `${DJANGO_API_BASE}/api/tables/requests/${activeRequest.id}/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'No se pudo marcar como atendida')
      }
      setMessage('Solicitud marcada como atendida')
      setActiveRequest(null)
      await loadTables()
    } catch (err: any) {
      setMessage(err.message || 'Error actualizando solicitud')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTables()
    const interval = setInterval(loadTables, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="module">
      <h2>Módulo Mesero</h2>
      <div className="panel">
        <div className="actions-row">
          <button onClick={loadTables} disabled={loading}>
            Refrescar mesas
          </button>
        </div>
        <div className="grid">
          {tables.map((table) => (
            <button
              key={table.id}
              className={`card-button ${table.status === 'requested' ? 'card-warning' : ''
                }`}
              onClick={() => loadActiveRequest(table)}
            >
              <strong>Mesa {table.table_number}</strong>
              <span>Estado: {table.status}</span>
              {table.status === 'requested' && (
                <span className="badge">Solicitud activa</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedTable && (
        <div className="panel">
          <h3>Detalle de mesa</h3>
          <p>
            Mesa: <strong>{selectedTable.table_number}</strong>
          </p>
          {activeRequest ? (
            <>
              <p>
                Solicitud:{' '}
                <strong>
                  {activeRequest.request_type === 'call_waiter' && 'Llamar mesero'}
                  {activeRequest.request_type === 'bill' && 'Pedir cuenta'}
                  {activeRequest.request_type === 'menu' && 'Ver menú'}
                  {activeRequest.request_type === 'other' && 'Otro'}
                </strong>
              </p>
              {activeRequest.notes && <p>Notas: {activeRequest.notes}</p>}
              <p>
                Creada:{' '}
                {new Date(activeRequest.created_at).toLocaleTimeString('es-CO')}
              </p>
              <div className="actions-row">
                <button onClick={markRequestCompleted} disabled={loading}>
                  Marcar como atendida
                </button>
              </div>
            </>
          ) : (
            <p>La mesa no tiene solicitudes pendientes.</p>
          )}
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  )
}

function KitchenModule() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await fetch(`${OPS_SERVICE_BASE}/kitchen/orders?status=pending`)
      if (!res.ok) throw new Error('No se pudieron cargar las órdenes')
      const data = (await res.json()) as Order[]
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, status: Order['status']) {
    await fetch(`${OPS_SERVICE_BASE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await loadOrders()
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="module">
      <h2>Módulo Cocina</h2>
      <button onClick={loadOrders} disabled={loading}>
        Refrescar órdenes
      </button>
      <div className="panel">
        {orders.length === 0 && <p>No hay órdenes pendientes</p>}
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <p>
              Mesa: <strong>{order.tableId}</strong>
            </p>
            <p>
              Creada:{' '}
              {new Date(order.createdAt).toLocaleTimeString('es-CO')}
            </p>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} x {item.name}
                  {item.notes && ` - ${item.notes}`}
                </li>
              ))}
            </ul>
            <div className="actions-row">
              <button onClick={() => updateStatus(order.id, 'in_kitchen')}>
                En preparación
              </button>
              <button onClick={() => updateStatus(order.id, 'served')}>
                Listo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [tab, setTab] = useState<'waiter' | 'kitchen'>('waiter')

  return (
    <div className="app-root">
      <header>
        <h1>Panel Operaciones - Avisame</h1>
        <nav className="tabs">
          <button
            className={tab === 'waiter' ? 'tab active' : 'tab'}
            onClick={() => setTab('waiter')}
          >
            Mesero
          </button>
          <button
            className={tab === 'kitchen' ? 'tab active' : 'tab'}
            onClick={() => setTab('kitchen')}
          >
            Cocina
          </button>
        </nav>
      </header>
      <main>
        {tab === 'waiter' ? <WaiterModule /> : <KitchenModule />}
      </main>
    </div>
  )
}

export default App
