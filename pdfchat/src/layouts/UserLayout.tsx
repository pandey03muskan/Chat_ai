import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import {styled} from "@mui/system";
import { useRouter } from 'next/router';


interface Props {
  children: ReactNode
}

const LayoutContainer = styled("div")({
  display:'flex',
  
});

const UserLayout = ({children}: Props) => {
  const router = useRouter();
//   const is404Page = router.pathname === '/404';
  return (
      <LayoutContainer>
      <Sidebar/>
      <div style={{width:'100%'}}>
        {children}
      </div>
      </LayoutContainer>
  )
}

export default UserLayout
