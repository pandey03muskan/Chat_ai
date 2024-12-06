import React, { useEffect, useState } from "react";
import { Typography, List, ListItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import Link from "next/link";
import { styled, useMediaQuery } from "@mui/system";
import { customColors } from "./customColors";
import logo_new from "../../public/logo_new.png";
import Image from "next/image";
import { useRouter } from "next/router";

const drawerWidth = 280;
const drawerWidthResizedSidebar = 80;

const DrawerContainer = styled("div")(({ isExpanded }: { isExpanded: boolean }) => ({
  width: isExpanded ? drawerWidth : drawerWidthResizedSidebar,
  transition: "width 0.5s ease",
  overflow: "hidden",
  height: "100vh",
  backgroundColor:'rgb(25, 22, 34)',
  color: customColors.white,
  position: "sticky",
  fontFamily:'Poppins',
  top: 0,
}));

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const router = useRouter();

  const handleResizeSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
  };

  // useEffect(() => {
  //   const activeMenuItem = menuItems.findIndex((item) => item.path === router.pathname);
  //   console.log(router.pathname)
  //   setActiveIndex(activeMenuItem);
  // }, [router.pathname]);

  const menuItems = [
    { text: "Chat With PDF", icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
    <path fill="currentColor" d="M3 20.077V4.616q0-.691.463-1.153T4.615 3h14.77q.69 0 1.152.463T21 4.616v10.769q0 .69-.463 1.153T19.385 17H6.077zM6.5 13.5h7v-1h-7zm0-3h11v-1h-11zm0-3h11v-1h-11z"></path>
  </svg>, path: "/chatwithpdf" },
  ];


  const isSmallestScreen = useMediaQuery('(min-width:900px) and (max-width:1155px)');
  const isMediumScreen = useMediaQuery('(min-width:1150px) and (max-width:1405px)');
  const isSmallScreen = useMediaQuery("(max-width:910px)");

  return (
    <>
      <DrawerContainer isExpanded={!isSmallScreen && isExpanded}>
        <div
          style={{
            padding: "1.5rem 1rem",
            paddingLeft: isExpanded && !isSmallScreen ? 3 : 1,
            transition: "padding-left 0.5s ease",
            display: "flex",
            justifyContent: "center",
            borderBottom: `0.1px solid ${customColors.lightgray}`,
          }}
        >
          {isExpanded && !isSmallScreen ? (
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
                color: customColors.lightlightgray,
              }}
            >
              <Image src={logo_new} alt="Logo" style={{ height: "auto", width: "30px" }} />
              ChatMate
            </Typography>
        ) : (
        <Image src={logo_new} alt="Logo" style={{ height: "auto", width: "30px" }} />
        )} 

          {/* Sidebar toggle button */}
          {!isSmallScreen?
            <div
            style={{
              position: "fixed",
              top: "3.8rem",
              left:isSmallestScreen
                  ? isExpanded
                    ? drawerWidth - 80
                          : drawerWidthResizedSidebar - 20
                  : isMediumScreen
                  ?isExpanded
                    ? drawerWidth - 70
                          : drawerWidthResizedSidebar - 20
                  : isExpanded
                    ? drawerWidth - 60
                          : drawerWidthResizedSidebar - 20,
              height: "2rem",
              width: "2rem",
              background:'rgb(25, 22, 34)',
              borderRadius: "8px",
              boxShadow:'rgba(15, 20, 34, 0.1) 0px 4px 18px 0px',
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: `0.5px solid ${customColors.lightlightgray}`,
              color: customColors.white,
              transition: "left 0.5s ease",
              pointerEvents: "auto",
            }}
            onClick={handleResizeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
	<path fill="white" d="M8.7 15.9L4.8 12l3.9-3.9a.984.984 0 0 0 0-1.4a.984.984 0 0 0-1.4 0l-4.59 4.59a.996.996 0 0 0 0 1.41l4.59 4.6c.39.39 1.01.39 1.4 0a.984.984 0 0 0 0-1.4m6.6 0l3.9-3.9l-3.9-3.9a.984.984 0 0 1 0-1.4a.984.984 0 0 1 1.4 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.6a.984.984 0 0 1-1.4 0a.984.984 0 0 1 0-1.4"></path>
</svg>
            {/* <CodeIcon sx={{ color: customColors.lightlightgray }} /> */}
            </div>:
          <></>
          }

        </div>

        <div style={{ marginTop: "1rem" }}>
          <List>
            {menuItems.map((item, index) => (
              <Link
                href={item.path}
                key={index}
                style={{ textDecoration: "none", color: customColors.lightgray }}
              >
                <ListItem
                  onClick={() => handleItemClick(index)}
                  sx={{
                    backgroundColor:
                      activeIndex === index ? 'rgb(87, 94, 104,0.2)' : "transparent",
                    color:
                      activeIndex === index ? customColors.lightlightgray : customColors.lightgray,
                    borderLeft: activeIndex === index ? "4px solid blue" : "none",
                    "&:hover": {
                      // backgroundColor: customColors.opacitygray,
                      background:'rgb(87, 94, 104,0.2)',
                      color: customColors.lightlightgray,
                      "& .MuiListItemIcon-root": {
                        color: customColors.lightlightgray,
                      },
                    },
                    transition: "background-color 0.3s ease, color 0.3s ease",
                  }}
                >
                  {isExpanded && !isSmallScreen ? (
                    <ListItemIcon
                      sx={{
                        color:
                          activeIndex === index
                            ? customColors.lightlightgray
                            : customColors.lightgray,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  ) : (
                    <Tooltip title={item.text} placement="right" arrow>
                      <ListItemIcon
                        sx={{
                          color:
                            activeIndex === index
                              ? customColors.lightlightgray
                              : customColors.lightgray,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </Tooltip>
                  )}

                  {isExpanded && !isSmallScreen && <ListItemText primary={item.text} />}
                </ListItem>
              </Link>
            ))}
          </List>
        </div>
      </DrawerContainer>
    </>
  );
};

export default Sidebar;

