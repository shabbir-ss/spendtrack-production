import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssetsTable from "@/components/tables/assets-table";
import AddAssetModal from "@/components/modals/add-asset-modal";
import { Plus } from "lucide-react";

export default function Assets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assets</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your asset portfolio and track depreciation</p>
        </div>
        <AddAssetModal>
          <div className="bg-asset hover:bg-asset/90 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Asset</span>
          </div>
        </AddAssetModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetsTable />
        </CardContent>
      </Card>
    </div>
  );
}
