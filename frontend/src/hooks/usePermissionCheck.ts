// src/hooks/usePermissionCheck.ts
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useState, useCallback } from 'react';

export function usePermissionCheck() {
  const { user } = useAuth();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('');

  const hasPermission = useCallback((permission: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const checkPermission = useCallback((requiredPermissions: string[], actionName: string) => {
    const missingPermissions = requiredPermissions.filter(perm => !hasPermission(perm));
    
    if (missingPermissions.length > 0) {
      setPermissionMessage(
        `Você não possui permissão para ${actionName}. ` +
        `Permissões necessárias: ${requiredPermissions.join(', ')}`
      );
      setShowPermissionDialog(true);
      return false;
    }
    
    return true;
  }, [hasPermission]);

  const PermissionDialog = () => (
    <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <AlertDialogContent className="border-amber-500/50">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">Acesso Restrito</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-amber-900 font-medium">{permissionMessage}</p>
                  <p className="text-xs text-amber-700 mt-2">
                    Entre em contato com o administrador do sistema se você acredita que deveria ter acesso.
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => setShowPermissionDialog(false)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    hasPermission,
    checkPermission,
    PermissionDialog,
  };
}