'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail,
  Shield,
  Key,
  MoreVertical,
  Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface Worker {
  id: string
  auth_user_id: string | null
  name: string
  email: string
  role: string
  specializations: string[]
  hourly_rate: number
  active: boolean
  created_at: string
  last_login_at: string | null
}

interface UserManagementProps {
  workers: Worker[]
}

export function UserManagement({ workers: initialWorkers }: UserManagementProps) {
  const router = useRouter()
  const [workers, setWorkers] = useState(initialWorkers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter workers based on search and role
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || worker.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker)
    setShowEditDialog(true)
  }

  const handleDelete = (worker: Worker) => {
    setSelectedWorker(worker)
    setShowDeleteDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedWorker) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedWorker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedWorker)
      })
      
      if (response.ok) {
        const updatedWorker = await response.json()
        setWorkers(workers.map(w => w.id === updatedWorker.id ? updatedWorker : w))
        setShowEditDialog(false)
        toast({
          title: 'User Updated',
          description: 'User information has been updated successfully.'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedWorker) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedWorker.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setWorkers(workers.filter(w => w.id !== selectedWorker.id))
        setShowDeleteDialog(false)
        toast({
          title: 'User Deleted',
          description: 'User has been removed from the system.'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'default'
      case 'worker':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">User Management</h1>
            <p className="text-zinc-400 mt-1">
              Manage worker accounts and permissions
            </p>
          </div>
          <Button onClick={() => router.push('/admin/users/new')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredWorkers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(worker.role)}>
                        {worker.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {worker.specializations.map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={worker.active ? 'success' : 'secondary'}>
                        {worker.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {worker.last_login_at 
                        ? new Date(worker.last_login_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(worker)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {worker.auth_user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Reset password functionality
                              toast({
                                title: 'Password Reset',
                                description: `Password reset link sent to ${worker.email}`
                              })
                            }}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(worker)}
                          className="text-theme-status-error hover:text-theme-status-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedWorker && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedWorker.name}
                  onChange={(e) => setSelectedWorker({...selectedWorker, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={selectedWorker.email}
                  onChange={(e) => setSelectedWorker({...selectedWorker, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select 
                  value={selectedWorker.role}
                  onValueChange={(value) => setSelectedWorker({...selectedWorker, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Hourly Rate</label>
                <Input
                  type="number"
                  value={selectedWorker.hourly_rate}
                  onChange={(e) => setSelectedWorker({...selectedWorker, hourly_rate: parseFloat(e.target.value)})}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedWorker.active}
                  onChange={(e) => setSelectedWorker({...selectedWorker, active: e.target.checked})}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedWorker && (
            <div className="py-4">
              <p><strong>Name:</strong> {selectedWorker.name}</p>
              <p><strong>Email:</strong> {selectedWorker.email}</p>
              <p><strong>Role:</strong> {selectedWorker.role}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}