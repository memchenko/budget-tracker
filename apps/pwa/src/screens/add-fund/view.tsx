import { observer } from 'mobx-react-lite';
import { useForm, Controller } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@nextui-org/input';
import { Card, CardHeader, CardBody } from '@nextui-org/card';
import { Switch } from '../../lib/ui/switch';
import { CardTitle } from '../../lib/ui/card-title';
import { Hint } from '../../lib/ui/hint';
import { PrimaryButton } from '../../lib/ui/primary-button';
import { Screen } from '../../layouts/screen';
import { AddFundController } from './controller';
import { useController } from '../../lib/hooks/useController';
import { z } from 'zod';

import { schema } from './schema';

export const AddFund = observer(() => {
  const ctrl = useController(AddFundController);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(ctrl.handleSubmit)}>
      <Screen>
        <Card className="card">
          <CardHeader className="card-element">
            <CardTitle>Name</CardTitle>
          </CardHeader>
          <CardBody className="card-element">
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} autoFocus label="Name" size="lg" />}
            />
          </CardBody>
        </Card>
        <Card className="card">
          <CardHeader className="card-element">
            <CardTitle>Capacity</CardTitle>
          </CardHeader>
          <CardBody className="card-element">
            <Controller
              name="capacity"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  label="Capacity"
                  placeholder="0.00"
                  size="lg"
                  value={String(value)}
                  onChange={(event) => {
                    onChange(parseFloat(event.target.value));
                  }}
                />
              )}
            />
          </CardBody>
        </Card>
        <Card className="card">
          <CardHeader className="card-element gap-1 items-start">
            <CardTitle>Initial Balance</CardTitle>
            <Hint>optional</Hint>
          </CardHeader>
          <CardBody className="card-element">
            <Controller
              name="initialBalance"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  label="Initial Balance"
                  placeholder="0.00"
                  size="lg"
                  value={String(value)}
                  onChange={(event) => {
                    onChange(parseFloat(event.target.value));
                  }}
                />
              )}
            />
          </CardBody>
        </Card>
        <Card className="card">
          <CardHeader className="card-element">
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardBody className="card-element flex flex-col gap-4">
            <Controller
              name="isCumulative"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Switch
                  {...field}
                  checked={value}
                  onChange={(event) => {
                    onChange(event.target.checked);
                  }}
                >
                  Cumulative
                </Switch>
              )}
            />
            <Controller
              name="takeDeficitFromWallet"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Switch
                  {...field}
                  checked={value}
                  onChange={(event) => {
                    onChange(event.target.checked);
                  }}
                >
                  Take deficit from wallet
                </Switch>
              )}
            />
            <Controller
              name="calculateDailyLimit"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Switch
                  {...field}
                  checked={value}
                  onChange={(event) => {
                    onChange(event.target.checked);
                  }}
                >
                  Calculate daily limit
                </Switch>
              )}
            />
          </CardBody>
        </Card>
        <PrimaryButton type="submit">Submit</PrimaryButton>
      </Screen>
      {ctrl.isSubmitted && <Navigate to="../" relative="route" />}
    </form>
  );
});