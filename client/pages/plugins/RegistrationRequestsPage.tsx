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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/state/AuthContext";
import type { RegistrationRequest } from "@/models/types";
import {
  getAllRegistrationRequests,
  getRegistrationRequestsByStatus,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  editRegistrationRequest,
} from "@/controllers/userManagementController";
import { Eye, Check, X, Edit2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegistrationRequestsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [editFormData, setEditFormData] = useState({
    companyName: "",
    registrationNumber: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    contactEmail: "",
    contactName: "",
    phone: "",
  });

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      let data: RegistrationRequest[];
      if (statusFilter === "all") {
        data = await getAllRegistrationRequests();
      } else {
        data = await getRegistrationRequestsByStatus(
          statusFilter as RegistrationRequest["status"],
        );
      }
      setRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load registration requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: RegistrationRequest) => {
    if (!user?.id) return;

    try {
      const updated = await approveRegistrationRequest(request.id, user.id);
      if (updated) {
        setRequests(requests.map((r) => (r.id === updated.id ? updated : r)));
        setShowDetailsDialog(false);
        toast({
          title: "Success",
          description: "Registration request approved",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user?.id || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const updated = await rejectRegistrationRequest(
        selectedRequest.id,
        rejectionReason,
        user.id,
      );
      if (updated) {
        setRequests(requests.map((r) => (r.id === updated.id ? updated : r)));
        setShowRejectDialog(false);
        setShowDetailsDialog(false);
        setRejectionReason("");
        toast({
          title: "Success",
          description: "Registration request rejected",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditDialog = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setEditFormData({
      companyName: request.companyName,
      registrationNumber: request.registrationNumber,
      address: request.address,
      city: request.city,
      postalCode: request.postalCode,
      country: request.country,
      contactEmail: request.contactEmail,
      contactName: request.contactName,
      phone: request.phone || "",
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest) return;

    try {
      const updated = await editRegistrationRequest(selectedRequest.id, editFormData);
      if (updated) {
        setRequests(requests.map((r) => (r.id === updated.id ? updated : r)));
        setShowEditDialog(false);
        toast({
          title: "Success",
          description: "Registration request updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("admin.registration.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.registration.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("admin.registration.listTitle")}</CardTitle>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "pending" | "approved" | "rejected")
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("admin.registration.pending")}</SelectItem>
                <SelectItem value="approved">{t("admin.registration.approved")}</SelectItem>
                <SelectItem value="rejected">{t("admin.registration.rejected")}</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("admin.registration.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.registration.companyName")}</TableHead>
                    <TableHead>{t("admin.registration.contactName")}</TableHead>
                    <TableHead>{t("admin.registration.city")}</TableHead>
                    <TableHead>{t("admin.registration.status")}</TableHead>
                    <TableHead>{t("admin.registration.createdAt")}</TableHead>
                    <TableHead>{t("admin.registration.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.companyName}
                      </TableCell>
                      <TableCell>{request.contactName}</TableCell>
                      <TableCell>{request.city}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "outline"
                              : request.status === "approved"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {t(
                            `admin.registration.${request.status}`,
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(request)}
                            >
                              <Edit2 className="size-4" />
                            </Button>
                          </>
                        )}
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
        <DialogContent className="max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.companyName}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-3 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.registration.registrationNumber")}
                </p>
                <p>{selectedRequest.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.registration.contactName")}
                </p>
                <p>{selectedRequest.contactName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.registration.contactEmail")}
                </p>
                <p>{selectedRequest.contactEmail}</p>
              </div>
              {selectedRequest.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("admin.registration.phone")}
                  </p>
                  <p>{selectedRequest.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.registration.address")}
                </p>
                <p>
                  {selectedRequest.address}, {selectedRequest.postalCode}{" "}
                  {selectedRequest.city}, {selectedRequest.country}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.registration.status")}
                </p>
                <Badge
                  variant={
                    selectedRequest.status === "pending"
                      ? "outline"
                      : selectedRequest.status === "approved"
                        ? "default"
                        : "destructive"
                  }
                >
                  {t(`admin.registration.${selectedRequest.status}`)}
                </Badge>
              </div>
              {selectedRequest.rejectionReason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("admin.registration.rejectionReason")}
                  </p>
                  <p>{selectedRequest.rejectionReason}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {selectedRequest.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedRequest)}
                      className="flex-1"
                    >
                      <Check className="mr-2 size-4" />
                      {t("admin.registration.approve")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <X className="mr-2 size-4" />
                      {t("admin.registration.reject")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.registration.rejectReason")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t("admin.registration.rejectPlaceholder")}
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button onClick={handleReject} variant="destructive" className="flex-1">
                {t("admin.registration.confirm")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                {t("admin.registration.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.registration.edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="companyName">{t("admin.registration.companyName")}*</Label>
              <Input
                id="companyName"
                value={editFormData.companyName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="regNumber">{t("admin.registration.registrationNumber")}*</Label>
              <Input
                id="regNumber"
                value={editFormData.registrationNumber}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    registrationNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="contactName">{t("admin.registration.contactName")}*</Label>
              <Input
                id="contactName"
                value={editFormData.contactName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    contactName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">{t("admin.registration.contactEmail")}*</Label>
              <Input
                id="contactEmail"
                type="email"
                value={editFormData.contactEmail}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    contactEmail: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">{t("admin.registration.phone")}</Label>
              <Input
                id="phone"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="address">{t("admin.registration.address")}*</Label>
              <Input
                id="address"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city">{t("admin.registration.city")}*</Label>
                <Input
                  id="city"
                  value={editFormData.city}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="postalCode">{t("admin.registration.postalCode")}*</Label>
                <Input
                  id="postalCode"
                  value={editFormData.postalCode}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      postalCode: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="country">{t("admin.registration.country")}*</Label>
              <Input
                id="country"
                value={editFormData.country}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, country: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEdit} className="flex-1">
                {t("admin.registration.save")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                {t("admin.registration.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
