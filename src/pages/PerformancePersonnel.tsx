import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Clock, CheckCircle, Users, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';
import { Progress } from '@/components/ui/progress';

const PerformancePersonnel: React.FC = () => {
  const { teamMembers, loading } = useTeamMembers();

  const getMemberStats = (member: any) => {
    // Calcul de statistiques basées sur les actions
    const actionsCount = member.actions_count || 0;
    const lastLogin = member.last_login_at ? new Date(member.last_login_at) : null;
    const daysSinceLastLogin = lastLogin ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    // Score de performance (0-100)
    const performanceScore = Math.min(100, actionsCount * 2);
    
    return {
      actionsCount,
      lastLogin,
      daysSinceLastLogin,
      performanceScore
    };
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-blue-500">Très Bien</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-500">Bien</Badge>;
    if (score >= 20) return <Badge className="bg-orange-500">À Améliorer</Badge>;
    return <Badge className="bg-red-500">Inactif</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais connecté';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeMembers = teamMembers.filter(m => m.is_active && m.status === 'accepted');
  const totalActions = activeMembers.reduce((sum, m) => sum + (m.actions_count || 0), 0);
  const avgPerformance = activeMembers.length > 0
    ? activeMembers.reduce((sum, m) => sum + getMemberStats(m).performanceScore, 0) / activeMembers.length
    : 0;

  return (
    <SubscriptionGuard feature="la gestion de performance">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance du Personnel</h1>
              <p className="text-gray-600">Suivez les performances et l'activité de votre équipe</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Membres Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeMembers.length}</div>
                <p className="text-xs text-muted-foreground">sur {teamMembers.length} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Actions Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActions}</div>
                <p className="text-xs text-muted-foreground">ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Performance Moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgPerformance.toFixed(0)}%</div>
                <Progress value={avgPerformance} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Cards */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeMembers.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Aucun membre actif"
              description="Invitez des membres d'équipe pour suivre leurs performances"
              actionLabel="Aller à l'équipe"
              onAction={() => window.location.href = '/equipe'}
            />
          ) : (
            <div className="grid gap-4">
              {activeMembers.map((member) => {
                const stats = getMemberStats(member);
                return (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{member.full_name || member.member_email}</CardTitle>
                          <CardDescription>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </CardDescription>
                        </div>
                        {getPerformanceBadge(stats.performanceScore)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Performance Score */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              Score de Performance
                            </span>
                            <span className="text-sm font-bold">{stats.performanceScore}%</span>
                          </div>
                          <Progress value={stats.performanceScore} className="h-2" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900">{stats.actionsCount}</p>
                              <p className="text-xs text-muted-foreground">Actions effectuées</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {stats.daysSinceLastLogin !== null 
                                  ? stats.daysSinceLastLogin === 0 
                                    ? "Aujourd'hui" 
                                    : `Il y a ${stats.daysSinceLastLogin}j`
                                  : 'Jamais'}
                              </p>
                              <p className="text-xs text-muted-foreground">Dernière connexion</p>
                            </div>
                          </div>
                        </div>

                        {/* Last Login Detail */}
                        <div className="pt-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            Dernière activité : {formatDate(stats.lastLogin)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default PerformancePersonnel;
