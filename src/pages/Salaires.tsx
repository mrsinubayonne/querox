import React, { useState, useMemo } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Plus, Check, Printer, Trash2, Users } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { useSalaryPayments, SalaryPayment } from '@/hooks/useSalaryPayments';

const Salaires: React.FC = () => {
  const { employees, loading: empLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { payments, loading: payLoading, createPayment, markAsPaid, deletePayment } = useSalaryPayments();

  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [printPayment, setPrintPayment] = useState<SalaryPayment | null>(null);

  const totalPaid = useMemo(
    () => Math.round(payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.net_amount), 0)),
    [payments]
  );
  const totalPending = useMemo(
    () => Math.round(payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.net_amount), 0)),
    [payments]
  );

  const handleEmployeeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Partial<Employee> = {
      full_name: String(fd.get('full_name') || ''),
      position: String(fd.get('position') || '') || null,
      email: String(fd.get('email') || '') || null,
      phone: String(fd.get('phone') || '') || null,
      base_salary: Number(fd.get('base_salary') || 0),
      payment_frequency: String(fd.get('payment_frequency') || 'monthly'),
      hire_date: String(fd.get('hire_date') || '') || null,
      is_active: true,
      notes: String(fd.get('notes') || '') || null,
    };
    const ok = editEmployee
      ? await updateEmployee(editEmployee.id, data)
      : await createEmployee(data);
    if (ok) {
      setEmpModalOpen(false);
      setEditEmployee(null);
    }
  };

  const openPayModal = (employeeId?: string) => {
    setSelectedEmployeeId(employeeId || (employees[0]?.id ?? ''));
    setPayModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const employee_id = String(fd.get('employee_id') || '');
    const base_amount = Number(fd.get('base_amount') || 0);
    const bonus_amount = Number(fd.get('bonus_amount') || 0);
    const advance_amount = Number(fd.get('advance_amount') || 0);
    const deductions_amount = Number(fd.get('deductions_amount') || 0);
    const net_amount = Math.max(0, base_amount + bonus_amount - advance_amount - deductions_amount);
    const status = (fd.get('status') as 'pending' | 'paid') || 'pending';
    const ok = await createPayment({
      employee_id,
      period_start: String(fd.get('period_start') || ''),
      period_end: String(fd.get('period_end') || ''),
      base_amount,
      bonus_amount,
      advance_amount,
      deductions_amount,
      net_amount,
      payment_method: String(fd.get('payment_method') || 'Espèces'),
      status,
      paid_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
      notes: String(fd.get('notes') || '') || null,
    });
    if (ok) setPayModalOpen(false);
  };

  const employeeName = (id: string) => employees.find(e => e.id === id)?.full_name || 'Employé';

  const handlePrintPayslip = (p: SalaryPayment) => {
    setPrintPayment(p);
    setTimeout(() => window.print(), 100);
    setTimeout(() => setPrintPayment(null), 1000);
  };

  return (
    <SubscriptionGuard feature="la gestion des salaires">
      <PageWithSidebar>
        <div className="space-y-6 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Salaires</h1>
                <p className="text-muted-foreground">Gérez la paie de votre équipe</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditEmployee(null); setEmpModalOpen(true); }} className="gap-2">
                <Users className="w-4 h-4" /> Nouvel employé
              </Button>
              <Button onClick={() => openPayModal()} disabled={employees.length === 0} className="gap-2">
                <Plus className="w-4 h-4" /> Nouvelle fiche de paie
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Employés actifs</CardDescription>
                <CardTitle className="text-3xl">{employees.filter(e => e.is_active).length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Salaires payés</CardDescription>
                <CardTitle className="text-3xl text-emerald-600">{totalPaid.toLocaleString('fr-FR')} XAF</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>En attente</CardDescription>
                <CardTitle className="text-3xl text-orange-600">{totalPending.toLocaleString('fr-FR')} XAF</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="payments">
            <TabsList>
              <TabsTrigger value="payments">Fiches de paie</TabsTrigger>
              <TabsTrigger value="employees">Employés</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-3">
              {payLoading ? (
                <p className="text-muted-foreground">Chargement...</p>
              ) : payments.length === 0 ? (
                <EmptyState icon={Wallet} title="Aucune fiche de paie" description="Créez une fiche pour démarrer." />
              ) : (
                payments.map(p => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{p.payslip_number}</h3>
                          {p.status === 'paid' ? (
                            <Badge className="bg-emerald-500"><Check className="w-3 h-3 mr-1" /> Payé</Badge>
                          ) : (
                            <Badge variant="secondary">En attente</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{employeeName(p.employee_id)}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.period_start} → {p.period_end} · {p.payment_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{Math.round(Number(p.net_amount)).toLocaleString('fr-FR')} XAF</p>
                      </div>
                      <div className="flex gap-2">
                        {p.status === 'pending' && (
                          <Button size="sm" variant="default" onClick={() => markAsPaid(p.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handlePrintPayslip(p)} title="Imprimer">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deletePayment(p.id)} title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="employees" className="space-y-3">
              {empLoading ? (
                <p className="text-muted-foreground">Chargement...</p>
              ) : employees.length === 0 ? (
                <EmptyState icon={Users} title="Aucun employé" description="Ajoutez votre premier employé." />
              ) : (
                employees.map(e => (
                  <Card key={e.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <h3 className="font-semibold">{e.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{e.position || '—'}</p>
                        <p className="text-xs text-muted-foreground">{e.email || e.phone || ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{Math.round(Number(e.base_salary)).toLocaleString('fr-FR')} XAF</p>
                        <p className="text-xs text-muted-foreground">/{e.payment_frequency === 'monthly' ? 'mois' : e.payment_frequency}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => openPayModal(e.id)}>Payer</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditEmployee(e); setEmpModalOpen(true); }}>Modifier</Button>
                        <Button size="sm" variant="outline" onClick={() => deleteEmployee(e.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Employee modal */}
        <Dialog open={empModalOpen} onOpenChange={(o) => { setEmpModalOpen(o); if (!o) setEditEmployee(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editEmployee ? 'Modifier' : 'Nouvel'} employé</DialogTitle>
              <DialogDescription>Renseignez les informations de l'employé</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmployeeSubmit} className="space-y-3">
              <div>
                <Label htmlFor="full_name">Nom complet *</Label>
                <Input id="full_name" name="full_name" required defaultValue={editEmployee?.full_name} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="position">Poste</Label>
                  <Input id="position" name="position" defaultValue={editEmployee?.position || ''} />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" defaultValue={editEmployee?.phone || ''} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editEmployee?.email || ''} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="base_salary">Salaire de base (XAF) *</Label>
                  <Input id="base_salary" name="base_salary" type="number" min="0" step="100" required defaultValue={editEmployee?.base_salary ?? 0} />
                </div>
                <div>
                  <Label htmlFor="payment_frequency">Fréquence</Label>
                  <select id="payment_frequency" name="payment_frequency" defaultValue={editEmployee?.payment_frequency || 'monthly'} className="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="monthly">Mensuel</option>
                    <option value="biweekly">Bimensuel</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="daily">Journalier</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="hire_date">Date d'embauche</Label>
                <Input id="hire_date" name="hire_date" type="date" defaultValue={editEmployee?.hire_date || ''} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} defaultValue={editEmployee?.notes || ''} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEmpModalOpen(false)}>Annuler</Button>
                <Button type="submit">{editEmployee ? 'Mettre à jour' : 'Créer'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment modal */}
        <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle fiche de paie</DialogTitle>
              <DialogDescription>Le montant net est calculé : base + prime − avance − retenues</DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <Label htmlFor="employee_id">Employé *</Label>
                <Select name="employee_id" value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="employee_id" value={selectedEmployeeId} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="period_start">Début période *</Label>
                  <Input id="period_start" name="period_start" type="date" required />
                </div>
                <div>
                  <Label htmlFor="period_end">Fin période *</Label>
                  <Input id="period_end" name="period_end" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="base_amount">Base (XAF) *</Label>
                  <Input id="base_amount" name="base_amount" type="number" min="0" step="100" required defaultValue={employees.find(e => e.id === selectedEmployeeId)?.base_salary ?? 0} />
                </div>
                <div>
                  <Label htmlFor="bonus_amount">Prime</Label>
                  <Input id="bonus_amount" name="bonus_amount" type="number" min="0" step="100" defaultValue={0} />
                </div>
                <div>
                  <Label htmlFor="advance_amount">Avance</Label>
                  <Input id="advance_amount" name="advance_amount" type="number" min="0" step="100" defaultValue={0} />
                </div>
                <div>
                  <Label htmlFor="deductions_amount">Retenues</Label>
                  <Input id="deductions_amount" name="deductions_amount" type="number" min="0" step="100" defaultValue={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="payment_method">Mode de paiement</Label>
                  <select id="payment_method" name="payment_method" defaultValue="Espèces" className="w-full border rounded-md px-3 py-2 text-sm">
                    <option>Espèces</option>
                    <option>Virement</option>
                    <option>Mobile Money</option>
                    <option>Chèque</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <select id="status" name="status" defaultValue="paid" className="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="paid">Payé immédiatement</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPayModalOpen(false)}>Annuler</Button>
                <Button type="submit">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payslip print view */}
        {printPayment && (
          <div className="hidden print:block p-8 text-black">
            <h1 className="text-2xl font-bold mb-1">Fiche de paie</h1>
            <p className="text-sm mb-6">N° {printPayment.payslip_number}</p>
            <div className="mb-4">
              <p><strong>Employé :</strong> {employeeName(printPayment.employee_id)}</p>
              <p><strong>Période :</strong> {printPayment.period_start} → {printPayment.period_end}</p>
              <p><strong>Statut :</strong> {printPayment.status === 'paid' ? 'Payé' : 'En attente'}</p>
              <p><strong>Mode de paiement :</strong> {printPayment.payment_method}</p>
            </div>
            <table className="w-full border-collapse border border-black">
              <tbody>
                <tr><td className="border border-black px-3 py-2">Salaire de base</td><td className="border border-black px-3 py-2 text-right">{Number(printPayment.base_amount).toLocaleString('fr-FR')} XAF</td></tr>
                <tr><td className="border border-black px-3 py-2">Prime</td><td className="border border-black px-3 py-2 text-right">+ {Number(printPayment.bonus_amount).toLocaleString('fr-FR')} XAF</td></tr>
                <tr><td className="border border-black px-3 py-2">Avance</td><td className="border border-black px-3 py-2 text-right">− {Number(printPayment.advance_amount).toLocaleString('fr-FR')} XAF</td></tr>
                <tr><td className="border border-black px-3 py-2">Retenues</td><td className="border border-black px-3 py-2 text-right">− {Number(printPayment.deductions_amount).toLocaleString('fr-FR')} XAF</td></tr>
                <tr className="font-bold"><td className="border border-black px-3 py-2">NET À PAYER</td><td className="border border-black px-3 py-2 text-right">{Math.round(Number(printPayment.net_amount)).toLocaleString('fr-FR')} XAF</td></tr>
              </tbody>
            </table>
            {printPayment.notes && <p className="mt-4 text-sm"><strong>Notes :</strong> {printPayment.notes}</p>}
            <p className="mt-8 text-xs">Émis le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        )}
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Salaires;
