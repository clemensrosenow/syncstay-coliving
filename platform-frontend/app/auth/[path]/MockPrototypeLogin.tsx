"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import {
  prototypeLoginAction,
  type PrototypeLoginState,
} from "./actions";

type MockPrototypeLoginProps = {
  mockUsers: {
    id: string;
    name: string;
    image: string | null;
    job: string | null;
  }[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const initialState: PrototypeLoginState = {
  error: null,
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full" disabled={disabled || pending} type="submit">
      {pending ? "Signing in..." : "Continue as selected traveler"}
    </Button>
  );
}

export function MockPrototypeLogin({
  mockUsers,
}: MockPrototypeLoginProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    mockUsers[0]?.id ?? "",
  );
  const [state, formAction] = useActionState(prototypeLoginAction, initialState);
  const selectedUser =
    mockUsers.find((user) => user.id === selectedUserId) ?? null;

  return (
    <section className="mt-6 w-full max-w-sm rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
      <h3 className=" font-medium text-foreground">Prototype Access</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Skip credentials and enter as a mock user.
      </p>
      <form action={formAction}>
        <input type="hidden" name="userId" value={selectedUserId} />
        <div className="mt-6 space-y-2">
          <Label htmlFor="prototype-traveler">
            Select traveler
          </Label>
          <Select
            value={selectedUserId}
            onValueChange={(value) => {
              setSelectedUserId(value);
            }}
            disabled={mockUsers.length === 0}
          >
            <SelectTrigger className="w-full min-h-14" id="prototype-traveler">
              <Item className="min-w-0 flex-1 border-0 px-0 py-4 text-left">
                {selectedUser ? (
                  <ItemMedia>
                    <Avatar className="size-9">
                      <AvatarImage
                        src={selectedUser.image ?? undefined}
                        alt={selectedUser.name}
                      />
                      <AvatarFallback className="bg-slate-200 text-slate-700">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                ) : null}
                <ItemContent className="min-w-0">
                  <ItemTitle className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm text-foreground">
                    {selectedUser?.job ?? "Select prototype job"}
                  </ItemTitle>
                  {selectedUser ? (
                    <ItemDescription className="truncate text-xs">
                      {selectedUser.name}
                    </ItemDescription>
                  ) : (
                    <ItemDescription className="truncate text-xs">
                      Choose seeded traveler
                    </ItemDescription>
                  )}
                </ItemContent>
              </Item>
            </SelectTrigger>
            <SelectContent position="popper">
              {mockUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <Item className="min-w-0 border-0 px-0 py-0">
                    <ItemMedia>
                      <Avatar className="size-9">
                        <AvatarImage src={user.image ?? undefined} alt={user.name} />
                        <AvatarFallback className="bg-slate-200 text-slate-700">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="min-w-0">
                      <ItemTitle className="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {user.job}
                      </ItemTitle>
                      <ItemDescription className="truncate text-xs">
                        {user.name}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SubmitButton disabled={!selectedUserId} />
        {state.error ? (
          <p className="mt-3 text-sm text-destructive">{state.error}</p>
        ) : null}
      </form>
    </section>
  );
}
