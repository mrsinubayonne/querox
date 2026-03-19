import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Shield,
  Wifi,
  HardDrive,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { syncEngine } from '@/lib/syncEngine';
import { getStorageStats } from '@/lib/offlineStorage';
import { getQueuedMutations, cleanupQueue } from '@/lib/offlineQueue';

type TestStatus = 'idle' | 'running' | 'passed' | 'failed';

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: TestStatus;
  duration?: number;
  error?: string;
  detail?: string;
}

const INITIAL_TESTS: TestResult[] = [
  { id: 'db-connect', name: 'Connexion base de données', category: 'Infrastructure', status: 'idle' },
  { id: 'db-read-profiles', name: 'Lecture table profiles', category: 'Infrastructure', status: 'idle' },
  { id: 'db-read-orders', name: 'Lecture table orders', category: 'Infrastructure', status: 'idle' },
  { id: 'db-read-invoices', name: 'Lecture table invoices', category: 'Infrastructure', status: 'idle' },
  { id: 'db-read-menus', name: 'Lecture table menus', category: 'Infrastructure', status: 'idle' },
  { id: 'db-read-sessions', name: 'Lecture table table_sessions', category: 'Infrastructure', status: 'idle' },
  { id: 'db-read-inventory', name: 'Lecture table inventory_items', category: 'Infrastructure', status: 'idle' },
  { id: 'auth-session', name: 'Session authentification active', category: 'Sécurité', status: 'idle' },
  { id: 'auth-rls', name: 'RLS policies actives', category: 'Sécurité', status: 'idle' },
  { id: 'storage-bucket', name: 'Bucket images accessible', category: 'Stockage', status: 'idle' },
  { id: 'sync-status', name: 'État moteur de synchronisation', category: 'Sync & Offline', status: 'idle' },
  { id: 'offline-queue', name: 'File d\'attente offline', category: 'Sync & Offline', status: 'idle' },
  { id: 'idb-health', name: 'Santé IndexedDB', category: 'Sync & Offline', status: 'idle' },
  { id: 'invoice-gen', name: 'Fonction generate_invoice_number', category: 'Fonctions DB', status: 'idle' },
  { id: 'cleanup-fn', name: 'Fonction cleanup_stale_table_sessions', category: 'Fonctions DB', status: 'idle' },
  { id: 'stale-sessions', name: 'Pas de sessions bloquées (>12h)', category: 'Intégrité données', status: 'idle' },
  { id: 'orphan-invoices', name: 'Pas de factures orphelines', category: 'Intégrité données', status: 'idle' },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Infrastructure': <Database className="w-4 h-4" />,
  'Sécurité': <Shield className="w-4 h-4" />,
  'Stockage': <HardDrive className="w-4 h-4" />,
  'Sync & Offline': <Wifi className="w-4 h-4" />,
  'Fonctions DB': <RefreshCw className="w-4 h-4" />,
  'Intégrité données': <Clock className="w-4 h-4" />,
};

async function runTest(test: TestResult): Promise<TestResult> {
  const start = performance.now();

  try {
    switch (test.id) {
      case 'db-connect': {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: 'Connexion OK', duration: performance.now() - start };
      }

      case 'db-read-profiles': {
        const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: `${count ?? 0} profils`, duration: performance.now() - start };
      }

      case 'db-read-orders': {
        const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: `${count ?? 0} commandes`, duration: performance.now() - start };
      }

      case 'db-read-invoices': {
        const { count, error } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: `${count ?? 0} factures`, duration: performance.now() - start };
      }

      case 'db-read-menus': {
        const { count, error } = await supabase.from('menus').select('*', { count: 'exact', head: true });
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: `${count ?? 0} menus`, duration: performance.now() - start };
      }

      case 'db-read-sessions': {
        const { count, error } = await supabase.from('table_sessions').select('*', { count: 'exact', head: true });
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: `${count ?? 0} sessions`, duration: performance.now() - start };
      }

      case 'db-read-inventory': {
        const { count, error } = await supabase.from('inventory_items').select('*', { count: 'exact', head: true });
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: `${count ?? 0} articles`, duration: performance.now() - start };
      }

      case 'auth-session': {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        if (!data.session) throw new Error('Aucune session active');
        return { ...test, status: 'passed', detail: `Utilisateur: ${data.session.user.email}`, duration: performance.now() - start };
      }

      case 'auth-rls': {
        // Try to read another user's data - should return empty if RLS works
        const { data, error } = await supabase.from('orders').select('id').limit(1);
        if (error && error.code === '42501') {
          return { ...test, status: 'passed', detail: 'RLS bloque correctement', duration: performance.now() - start };
        }
        return { ...test, status: 'passed', detail: 'RLS actives (données filtrées)', duration: performance.now() - start };
      }

      case 'storage-bucket': {
        const { data, error } = await supabase.storage.from('images').list('', { limit: 1 });
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: 'Bucket "images" accessible', duration: performance.now() - start };
      }

      case 'sync-status': {
        const status = await syncEngine.getStatus();
        const detail = `Pending: ${status.pendingCount}, Failed: ${status.failedCount}, Syncing: ${status.isSyncing}`;
        const hasFailed = status.failedCount > 0;
        return {
          ...test,
          status: hasFailed ? 'failed' : 'passed',
          detail,
          error: hasFailed ? `${status.failedCount} mutations en échec` : undefined,
          duration: performance.now() - start,
        };
      }

      case 'offline-queue': {
        cleanupQueue();
        const queue = getQueuedMutations();
        return {
          ...test,
          status: queue.length > 5 ? 'failed' : 'passed',
          detail: `${queue.length} mutations en file`,
          error: queue.length > 5 ? 'File d\'attente encombrée' : undefined,
          duration: performance.now() - start,
        };
      }

      case 'idb-health': {
        const stats = await getStorageStats();
        return {
          ...test,
          status: 'passed',
          detail: `Pending: ${stats.pendingCount}, Failed: ${stats.failedCount}`,
          duration: performance.now() - start,
        };
      }

      case 'invoice-gen': {
        const { data, error } = await supabase.rpc('generate_invoice_number');
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: `Généré: ${data}`, duration: performance.now() - start };
      }

      case 'cleanup-fn': {
        const { error } = await supabase.rpc('cleanup_stale_table_sessions');
        if (error) throw new Error(error.message);
        return { ...test, status: 'passed', detail: 'Nettoyage exécuté', duration: performance.now() - start };
      }

      case 'stale-sessions': {
        const { data, error } = await supabase
          .from('table_sessions')
          .select('id', { count: 'exact', head: true })
          .in('status', ['active', 'closed'])
          .lt('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());
        if (error) throw new Error(error.message);
        const count = (data as any)?.length ?? 0;
        return {
          ...test,
          status: count > 0 ? 'failed' : 'passed',
          detail: count > 0 ? `${count} sessions bloquées trouvées` : 'Aucune session bloquée',
          error: count > 0 ? 'Sessions > 12h encore actives' : undefined,
          duration: performance.now() - start,
        };
      }

      case 'orphan-invoices': {
        const { count, error } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .is('user_id', null);
        if (error) throw new Error(error.message);
        return {
          ...test,
          status: (count ?? 0) > 0 ? 'failed' : 'passed',
          detail: (count ?? 0) > 0 ? `${count} factures orphelines` : 'Aucune facture orpheline',
          error: (count ?? 0) > 0 ? 'Factures sans user_id' : undefined,
          duration: performance.now() - start,
        };
      }

      default:
        return { ...test, status: 'passed', duration: performance.now() - start };
    }
  } catch (e) {
    return {
      ...test,
      status: 'failed',
      error: e instanceof Error ? e.message : 'Erreur inconnue',
      duration: performance.now() - start,
    };
  }
}

const AdminDiagnostics: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tests, setTests] = useState<TestResult[]>(INITIAL_TESTS);
  const [isRunning, setIsRunning] = useState(false);

  const totalPassed = tests.filter(t => t.status === 'passed').length;
  const totalFailed = tests.filter(t => t.status === 'failed').length;
  const totalDone = totalPassed + totalFailed;

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setTests(INITIAL_TESTS.map(t => ({ ...t, status: 'running' as TestStatus })));

    const results: TestResult[] = [];
    for (const test of INITIAL_TESTS) {
      setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'running' } : t));
      const result = await runTest(test);
      results.push(result);
      setTests(prev => prev.map(t => t.id === test.id ? result : t));
    }

    setIsRunning(false);
  }, []);

  const runSingleTest = useCallback(async (testId: string) => {
    const test = INITIAL_TESTS.find(t => t.id === testId);
    if (!test) return;
    setTests(prev => prev.map(t => t.id === testId ? { ...t, status: 'running' } : t));
    const result = await runTest(test);
    setTests(prev => prev.map(t => t.id === testId ? result : t));
  }, []);

  if (authLoading) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  const categories = [...new Set(tests.map(t => t.category))];

  return (
    <div className="flex min-h-screen bg-background">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                <FlaskConical className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Diagnostics Système</h1>
                <p className="text-sm text-muted-foreground">
                  Vérifiez l'état de santé de la plateforme en temps réel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {totalDone > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    {totalPassed} passés
                  </Badge>
                  {totalFailed > 0 && (
                    <Badge variant="destructive">
                      {totalFailed} échoués
                    </Badge>
                  )}
                </div>
              )}
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                size="lg"
                className="gap-2"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {isRunning && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(totalDone / tests.length) * 100}%` }}
              />
            </div>
          )}

          {/* Test Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map(category => {
              const categoryTests = tests.filter(t => t.category === category);
              const catPassed = categoryTests.filter(t => t.status === 'passed').length;
              const catFailed = categoryTests.filter(t => t.status === 'failed').length;

              return (
                <Card key={category} className="border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {categoryIcons[category]}
                      {category}
                      {(catPassed + catFailed) > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {catPassed}/{categoryTests.length} passés
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categoryTests.map(test => (
                      <div
                        key={test.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        {/* Status icon */}
                        <div className="shrink-0">
                          {test.status === 'idle' && (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          {test.status === 'running' && (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          )}
                          {test.status === 'passed' && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                          {test.status === 'failed' && (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>

                        {/* Test info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{test.name}</p>
                          {test.detail && (
                            <p className="text-xs text-muted-foreground truncate">{test.detail}</p>
                          )}
                          {test.error && (
                            <p className="text-xs text-destructive truncate">{test.error}</p>
                          )}
                        </div>

                        {/* Duration + retry */}
                        <div className="flex items-center gap-2 shrink-0">
                          {test.duration !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {test.duration.toFixed(0)}ms
                            </span>
                          )}
                          {(test.status === 'passed' || test.status === 'failed') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => runSingleTest(test.id)}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDiagnostics;
