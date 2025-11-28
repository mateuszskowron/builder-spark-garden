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
import type { Company } from "@/models/types";
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  toggleCompanyActive,
} from "@/controllers/userManagementController";
import { Plus, Edit2, Eye } from "lucide-react";

export default function CompaniesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        registrationNumber: company.registrationNumber,
        address: company.address,
        city: company.city,
        postalCode: company.postalCode,
        country: company.country,
        email: company.email,
        phone: company.phone || "",
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: "",
        registrationNumber: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        email: "",
        phone: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.registrationNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCompany) {
        const updated = await updateCompany(editingCompany.id, formData);
        if (updated) {
          setCompanies(
            companies.map((c) => (c.id === updated.id ? updated : c)),
          );
          toast({
            title: "Success",
            description: "Company updated successfully",
          });
        }
      } else {
        const newCompany = await createCompany(formData);
        setCompanies([...companies, newCompany]);
        toast({
          title: "Success",
          description: "Company created successfully",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (company: Company) => {
    try {
      const updated = await toggleCompanyActive(company.id, !company.active);
      if (updated) {
        setCompanies(
          companies.map((c) => (c.id === updated.id ? updated : c)),
        );
        toast({
          title: "Success",
          description: `Company ${updated.active ? "activated" : "deactivated"}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle company status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("admin.companies.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.companies.description")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 size-4" />
              {t("admin.companies.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCompany
                  ? t("admin.companies.edit")
                  : t("admin.companies.add")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("admin.companies.name")}*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="regNumber">
                  {t("admin.companies.registrationNumber")}*
                </Label>
                <Input
                  id="regNumber"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationNumber: e.target.value,
                    })
                  }
                  placeholder="Registration number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">{t("admin.companies.email")}*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("admin.companies.phone")}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="address">{t("admin.companies.address")}*</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t("admin.companies.city")}*</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">
                    {t("admin.companies.postalCode")}*
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postalCode: e.target.value,
                      })
                    }
                    placeholder="Postal code"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">{t("admin.companies.country")}*</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="Country"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {t("admin.companies.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("admin.companies.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.companies.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("admin.companies.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.companies.name")}</TableHead>
                    <TableHead>{t("admin.companies.registrationNumber")}</TableHead>
                    <TableHead>{t("admin.companies.city")}</TableHead>
                    <TableHead>{t("admin.companies.country")}</TableHead>
                    <TableHead>{t("admin.companies.status")}</TableHead>
                    <TableHead>{t("admin.companies.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.name}
                      </TableCell>
                      <TableCell>{company.registrationNumber}</TableCell>
                      <TableCell>{company.city}</TableCell>
                      <TableCell>{company.country}</TableCell>
                      <TableCell>
                        <Badge variant={company.active ? "default" : "secondary"}>
                          {company.active
                            ? t("admin.companies.active")
                            : t("admin.companies.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(company)}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(company)}
                        >
                          {company.active
                            ? t("admin.companies.deactivate")
                            : t("admin.companies.activate")}
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

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-3 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.companies.registrationNumber")}
                </p>
                <p>{selectedCompany.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.companies.email")}
                </p>
                <p>{selectedCompany.email}</p>
              </div>
              {selectedCompany.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("admin.companies.phone")}
                  </p>
                  <p>{selectedCompany.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.companies.address")}
                </p>
                <p>
                  {selectedCompany.address}, {selectedCompany.postalCode}{" "}
                  {selectedCompany.city}, {selectedCompany.country}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.companies.createdAt")}
                </p>
                <p>{new Date(selectedCompany.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
