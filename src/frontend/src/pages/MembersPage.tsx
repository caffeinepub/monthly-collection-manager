import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddMember,
  useDeleteMember,
  useGetAllMembers,
  useUpdateMember,
} from "../hooks/useQueries";
import type { Member } from "../hooks/useQueries";

type MemberForm = { name: string; serial: string; joinDate: string };
const emptyForm: MemberForm = { name: "", serial: "", joinDate: "" };

export default function MembersPage() {
  const { data: members, isLoading } = useGetAllMembers();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);

  function openAdd() {
    setForm(emptyForm);
    setAddOpen(true);
  }

  function openEdit(m: Member) {
    setForm({ name: m.name, serial: m.serial, joinDate: m.joinDate });
    setEditMember(m);
  }

  async function handleSubmitAdd() {
    if (!form.name || !form.serial || !form.joinDate) {
      toast.error("All fields are required");
      return;
    }
    try {
      await addMember.mutateAsync(form);
      toast.success("Member added successfully");
      setAddOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to add member");
    }
  }

  async function handleSubmitEdit() {
    if (!editMember || !form.name || !form.serial || !form.joinDate) {
      toast.error("All fields are required");
      return;
    }
    try {
      await updateMember.mutateAsync({ id: editMember.id, ...form });
      toast.success("Member updated");
      setEditMember(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update member");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMember.mutateAsync(deleteTarget.id);
      toast.success("Member deleted");
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete member");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members
              ? `${members.length} members registered`
              : "Manage your collection members"}
          </p>
        </div>
        <Button
          data-ocid="members.add.primary_button"
          onClick={openAdd}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !members || members.length === 0 ? (
          <div
            data-ocid="members.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
          >
            <Users className="w-10 h-10 opacity-30" />
            <p className="text-sm">No members yet. Add your first member.</p>
            <Button variant="outline" onClick={openAdd} className="mt-1">
              Add Member
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Serial
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Join Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, i) => (
                <TableRow
                  key={member.id.toString()}
                  data-ocid={`members.item.${i + 1}`}
                  className="border-border hover:bg-muted/40"
                >
                  <TableCell className="pl-5 text-sm text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {member.serial}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    {member.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.joinDate}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        data-ocid={`members.edit_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(member)}
                        className="h-8 px-2.5 hover:bg-accent hover:text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        data-ocid={`members.delete_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(member)}
                        className="h-8 px-2.5 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="members.add.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Enter the member details below.
            </DialogDescription>
          </DialogHeader>
          <MemberFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="members.add.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="members.add.submit_button"
              onClick={handleSubmitAdd}
              disabled={addMember.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addMember.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog
        open={!!editMember}
        onOpenChange={(o) => !o && setEditMember(null)}
      >
        <DialogContent data-ocid="members.edit.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update the member information.
            </DialogDescription>
          </DialogHeader>
          <MemberFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditMember(null)}
              data-ocid="members.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="members.edit.submit_button"
              onClick={handleSubmitEdit}
              disabled={updateMember.isPending}
              className="bg-primary text-primary-foreground"
            >
              {updateMember.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          data-ocid="members.delete.dialog"
          className="sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="members.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="members.delete.confirm_button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMember.isPending}
            >
              {deleteMember.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberFormFields({
  form,
  setForm,
}: {
  form: { name: string; serial: string; joinDate: string };
  setForm: (f: { name: string; serial: string; joinDate: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="member-name">Name</Label>
        <Input
          data-ocid="members.name.input"
          id="member-name"
          placeholder="Enter full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="member-serial">Serial Number</Label>
        <Input
          data-ocid="members.serial.input"
          id="member-serial"
          placeholder="e.g. M-001"
          value={form.serial}
          onChange={(e) => setForm({ ...form, serial: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="member-joindate">Join Date</Label>
        <Input
          data-ocid="members.joindate.input"
          id="member-joindate"
          type="date"
          value={form.joinDate}
          onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
        />
      </div>
    </div>
  );
}
