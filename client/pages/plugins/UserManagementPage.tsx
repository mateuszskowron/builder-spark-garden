import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { CompanyUser, UserRole } from "@/models/types";
import {
  getAllUsers,
  getAllCompanies,
  createCompanyUser,
  updateUserRole,
  toggleCompanyUserActive,
  deleteCompanyUser,
  resetUserPassword,
} from "@/controllers/userManagementController";
import { Plus, Edit2, Key, Trash2 } from "lucide-react";

const USER_ROLE_KEYS: { value: UserRole; labelKey: string }[] = [
  { value: "admin", labelKey: "admin.users.roleAdministrator" },
  { value: "manager", labelKey: "admin.users.roleManager" },
  { value: "buyer", labelKey: "admin.users.roleBuyer" },
  { value: "seller", labelKey: "admin.users.roleSeller" },
  { value: "user", labelKey: "admin.users.roleUser" },
];

export default function UserManagementPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("");

  const [formData, setFormData] = useState({
    companyId: "",
    name: "",
    email: "",
    userRole: "user" as UserRole,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, companiesData] = await Promise.all([
        getAllUsers(),
        getAllCompanies(),
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("admin.users.loadError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = selectedCompanyFilter
    ? users.filter((u) => u.companyId === selectedCompanyFilter)
    : users;

  const handleOpenDialog = () => {
    setFormData({
      companyId: "",
      name: "",
      email: "",
      userRole: "user",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyId || !formData.name || !formData.email) {
      toast({
        title: t("admin.users.validationError"),
        description: t("admin.users.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      const newUser = await createCompanyUser(formData);
      setUsers([...users, newUser]);
      setIsDialogOpen(false);
      toast({
        title: t("success"),
        description: t("admin.users.created"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("admin.users.createError"),
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (user: CompanyUser) => {
    try {
      const updated = await toggleCompanyUserActive(user.id, !user.active);
      if (updated) {
        setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
        toast({
          title: t("success"),
          description: updated.active
            ? t("admin.users.activate")
            : t("admin.users.deactivate"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("admin.users.updateError"),
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (user: CompanyUser, role: UserRole) => {
    try {
      const updated = await updateUserRole(user.id, role);
      if (updated) {
        setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
        toast({
          title: t("success"),
          description: t("admin.users.updated"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("admin.users.updateError"),
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (user: CompanyUser) => {
    try {
      const tempPassword = await resetUserPassword(user.id);
      toast({
        title: t("success"),
        description: t("admin.users.passwordReset", { password: tempPassword }),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("admin.users.resetError"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: CompanyUser) => {
    if (!confirm(t("admin.users.confirmDelete", { name: user.name }))) return;

    try {
      const success = await deleteCompanyUser(user.id);
      if (success) {
        setUsers(users.filter((u) => u.id !== user.id));
        toast({
          title: t("success"),
          description: t("admin.users.deleted"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("admin.users.deleteError"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("admin.users.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.users.description")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 size-4" />
              {t("admin.users.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.users.add")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company">{t("admin.users.company")}*</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, companyId: value })
                  }
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder={t("admin.users.companyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">{t("admin.users.name")}*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("admin.users.namePlaceholder")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">{t("admin.users.email")}*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t("admin.users.emailPlaceholder")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">{t("admin.users.role")}*</Label>
                <Select
                  value={formData.userRole}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      userRole: value as UserRole,
                    })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder={t("admin.users.rolePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLE_KEYS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {t(r.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {t("admin.users.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("admin.users.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("admin.users.listTitle")}</CardTitle>
            <Select value={selectedCompanyFilter === "" ? "all" : selectedCompanyFilter} onValueChange={(value) => setSelectedCompanyFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("admin.users.allCompanies")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.users.allCompanies")}</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t("loading")}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("admin.users.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.users.name")}</TableHead>
                    <TableHead>{t("admin.users.email")}</TableHead>
                    <TableHead>{t("admin.users.company")}</TableHead>
                    <TableHead>{t("admin.users.role")}</TableHead>
                    <TableHead>{t("admin.users.status")}</TableHead>
                    <TableHead>{t("admin.users.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companyName}</TableCell>
                      <TableCell>
                        <Select
                          value={user.userRole}
                          onValueChange={(value) =>
                            handleUpdateRole(user, value as UserRole)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {USER_ROLE_KEYS.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {t(r.labelKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active
                            ? t("admin.users.active")
                            : t("admin.users.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          title="Reset password"
                        >
                          <Key className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.active
                            ? t("admin.users.deactivate")
                            : t("admin.users.activate")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
